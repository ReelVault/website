import type { PluginCatalogEntry, PluginRepository } from "@reelvault/sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useRef, useState } from "react";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "../../utils/toast-utils";
import { reelvault } from "../client";
import { adminKeys, pluginKeys } from "../utils/query-keys";

export interface InstallCatalogPluginInput {
	repositoryId: string;
	pluginId: string;
	version?: string;
}

/** One file in the archive-upload queue, with live upload/install state. */
export interface PluginArchiveEntry {
	id: string;
	file: File;
	status: "queued" | "uploading" | "installing" | "installed" | "failed";
	uploadedBytes: number;
	totalBytes: number;
	error?: string | undefined;
}

/** Aggregate progress of the current archive batch, for the upload panel. */
export interface PluginArchiveSummary {
	doneCount: number;
	total: number;
	currentEntry: PluginArchiveEntry | null;
	overallPercent: number;
	uploadedBytes: number;
	totalBytes: number;
	etaSeconds: number | null;
}

const UPLOAD_INSTALL_STEPS = 2;

function isTerminalEntry(entry: PluginArchiveEntry): boolean {
	return entry.status === "installed" || entry.status === "failed";
}

/** Uploading counts for half the entry's progress; the (server-side) install step is the other half. */
function entryProgressPercent(entry: PluginArchiveEntry): number {
	if (entry.status === "installed" || entry.status === "failed") return 100;

	const uploadFraction = entry.totalBytes > 0 ? Math.min(1, entry.uploadedBytes / entry.totalBytes) : 0;
	const installFraction = entry.status === "installing" ? 1 : 0;

	return Math.round(((uploadFraction + installFraction) / UPLOAD_INSTALL_STEPS) * 100);
}

export function usePluginCatalog() {
	const queryClient = useQueryClient();

	const catalogQuery = useQuery<PluginCatalogEntry[]>({
		queryKey: pluginKeys.catalog(),
		queryFn: async () => {
			return await reelvault.admin.getPluginCatalog();
		},
		staleTime: 60_000,
	});

	const repositoriesQuery = useQuery<PluginRepository[]>({
		queryKey: pluginKeys.repositories(),
		queryFn: async () => {
			return await reelvault.admin.getPluginRepositories();
		},
		staleTime: 60_000,
	});

	const invalidateCatalogViews = useCallback(
		() =>
			Promise.all([
				queryClient.invalidateQueries({ queryKey: pluginKeys.catalog() }),
				queryClient.invalidateQueries({ queryKey: pluginKeys.repositories() }),
				queryClient.invalidateQueries({ queryKey: adminKeys.plugins() }),
				queryClient.invalidateQueries({ queryKey: pluginKeys.all }),
			]),
		[queryClient],
	);

	const installMutation = useMutation({
		mutationFn: async (input: InstallCatalogPluginInput) => {
			return await reelvault.admin.installCatalogPlugin(input);
		},
		onSuccess: async (result) => {
			await invalidateCatalogViews();
			toast.success(m.admin_plugins_catalog_toast_installed(result));

			// Catalog installs enable the plugin immediately; a load failure (e.g. a
			// missing API token) would otherwise stay silent in the installed list.
			const installed = await reelvault.admin.getPlugins();
			const status = installed.find((plugin) => plugin.id === result.pluginId);
			if (status?.state === "failed") {
				toast.warning(m.admin_plugins_install_failed_to_start({ name: status.name }), {
					description: status.error,
				});
			}
		},
		onError: (error) => {
			toastError(m.admin_plugins_catalog_install_failed(), error, m.toast_plugins_unexpected_error());
		},
	});

	// -- Archive upload queue -----------------------------------------------------
	// Sequential uploads with live per-file progress (XHR onprogress). One failed
	// file does not abort the batch — the panel shows per-file status and the
	// toast summarises installed/failed counts at the end.

	const [archiveEntries, setArchiveEntries] = useState<PluginArchiveEntry[]>([]);
	const [uploadEtaSeconds, setUploadEtaSeconds] = useState<number | null>(null);
	// Upload-throughput clock, touched only from event handlers (never render).
	const batchClockRef = useRef({ startedAt: 0, uploadedBytes: 0 });

	const patchArchiveEntry = useCallback((id: string, patch: Partial<PluginArchiveEntry>) => {
		setArchiveEntries((previous) => previous.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));
	}, []);

	const installArchive = useCallback(
		async (files: File[]): Promise<void> => {
			const queued: PluginArchiveEntry[] = files.map((file, index) => ({
				id: `${Date.now()}-${index}`,
				file,
				status: "queued",
				uploadedBytes: 0,
				totalBytes: file.size,
			}));
			const totalQueueBytes = queued.reduce((sum, entry) => sum + entry.totalBytes, 0);
			setArchiveEntries(queued);
			setUploadEtaSeconds(null);
			batchClockRef.current = { startedAt: Date.now(), uploadedBytes: 0 };

			let installed = 0;
			let failed = 0;
			for (const entry of queued) {
				patchArchiveEntry(entry.id, { status: "uploading" });
				try {
					await reelvault.admin.installPluginArchive(entry.file, (uploadedBytes, totalBytes) => {
						patchArchiveEntry(entry.id, {
							uploadedBytes,
							totalBytes,
							// The server response only arrives after install finishes —
							// flip to "installing" as soon as the bytes are all sent.
							status: uploadedBytes >= totalBytes ? "installing" : "uploading",
						});
						const batch = batchClockRef.current;
						const doneBytes = batch.uploadedBytes + uploadedBytes;
						const remainingBytes = Math.max(0, totalQueueBytes - doneBytes);
						const elapsedSeconds = (Date.now() - batch.startedAt) / 1000;
						// ETA covers the upload only — the install step is server-side and short.
						setUploadEtaSeconds(
							doneBytes > 0 && remainingBytes > 0 ? Math.max(1, Math.round((elapsedSeconds / doneBytes) * remainingBytes)) : null,
						);
					});
					batchClockRef.current.uploadedBytes += entry.file.size;
					patchArchiveEntry(entry.id, { status: "installed" });
					installed += 1;
				} catch (error) {
					batchClockRef.current.uploadedBytes += entry.file.size;
					patchArchiveEntry(entry.id, { status: "failed", error: error instanceof Error ? error.message : String(error) });
					failed += 1;
				}
			}

			await invalidateCatalogViews();
			if (failed === 0) toast.success(m.admin_plugins_upload_toast_installed({ count: installed }));
			else toast.error(m.admin_plugins_upload_toast_partial({ installed, failed, total: installed + failed }));
		},
		[invalidateCatalogViews, patchArchiveEntry],
	);

	const clearArchiveEntries = useCallback(() => {
		setArchiveEntries([]);
		setUploadEtaSeconds(null);
	}, []);

	const isInstallingArchive = archiveEntries.some(
		(entry) => entry.status === "queued" || entry.status === "uploading" || entry.status === "installing",
	);

	const archiveSummary = useMemo<PluginArchiveSummary | null>(() => {
		if (archiveEntries.length === 0) return null;

		const doneCount = archiveEntries.filter((entry) => isTerminalEntry(entry)).length;
		const currentEntry = archiveEntries.find((entry) => !isTerminalEntry(entry)) ?? null;
		const totalBytes = archiveEntries.reduce((sum, entry) => sum + entry.totalBytes, 0);
		const uploadedBytes = archiveEntries.reduce((sum, entry) => sum + Math.min(entry.uploadedBytes, entry.totalBytes), 0);
		const currentFraction = currentEntry ? entryProgressPercent(currentEntry) / 100 : 0;
		const overallPercent = Math.round(((doneCount + currentFraction) / archiveEntries.length) * 100);

		return {
			doneCount,
			total: archiveEntries.length,
			currentEntry,
			overallPercent,
			uploadedBytes,
			totalBytes,
			etaSeconds: uploadEtaSeconds,
		};
	}, [archiveEntries, uploadEtaSeconds]);

	const uninstallMutation = useMutation({
		mutationFn: async (pluginId: string) => {
			return await reelvault.admin.uninstallPlugin(pluginId);
		},
		onSuccess: async () => {
			await invalidateCatalogViews();
			toast.success(m.admin_plugins_catalog_toast_uninstalled());
		},
		onError: (error) => {
			toastError(m.admin_plugins_catalog_uninstall_failed(), error, m.toast_plugins_unexpected_error());
		},
	});

	const createRepositoryMutation = useMutation({
		mutationFn: async (body: { name: string; url: string; token?: string }) => {
			return await reelvault.admin.createPluginRepository(body);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: pluginKeys.repositories() });
			await queryClient.invalidateQueries({ queryKey: pluginKeys.catalog() });
			toast.success(m.admin_plugins_repositories_toast_added());
		},
		onError: (error) => {
			toastError(m.admin_plugins_repositories_add_failed(), error, m.toast_plugins_unexpected_error());
		},
	});

	const updateRepositoryMutation = useMutation({
		mutationFn: async (input: {
			repositoryId: string;
			body: { name?: string; url?: string; token?: string | null; enabled?: boolean };
		}) => {
			return await reelvault.admin.updatePluginRepository(input.repositoryId, input.body);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: pluginKeys.repositories() });
			await queryClient.invalidateQueries({ queryKey: pluginKeys.catalog() });
		},
		onError: (error) => {
			toastError(m.admin_plugins_repositories_update_failed(), error, m.toast_plugins_unexpected_error());
		},
	});

	const deleteRepositoryMutation = useMutation({
		mutationFn: async (repositoryId: string) => {
			return await reelvault.admin.deletePluginRepository(repositoryId);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: pluginKeys.repositories() });
			await queryClient.invalidateQueries({ queryKey: pluginKeys.catalog() });
			toast.success(m.admin_plugins_repositories_toast_deleted());
		},
		onError: (error) => {
			toastError(m.admin_plugins_repositories_delete_failed(), error, m.toast_plugins_unexpected_error());
		},
	});

	const refreshRepositoryMutation = useMutation({
		mutationFn: async (repositoryId: string) => {
			return await reelvault.admin.refreshPluginRepository(repositoryId);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: pluginKeys.repositories() });
			await queryClient.invalidateQueries({ queryKey: pluginKeys.catalog() });
			toast.success(m.admin_plugins_repositories_toast_refreshed());
		},
		onError: (error) => {
			toastError(m.admin_plugins_repositories_refresh_failed(), error, m.toast_plugins_unexpected_error());
		},
	});

	return {
		catalogQuery,
		catalog: catalogQuery.data ?? [],
		repositoriesQuery,
		repositories: repositoriesQuery.data ?? [],
		installPlugin: installMutation.mutateAsync,
		installArchive,
		archiveEntries,
		archiveSummary,
		isInstallingArchive,
		clearArchiveEntries,
		uninstallPlugin: uninstallMutation.mutateAsync,
		createRepository: createRepositoryMutation.mutateAsync,
		updateRepository: (repositoryId: string, body: { name?: string; url?: string; token?: string | null; enabled?: boolean }) =>
			updateRepositoryMutation.mutateAsync({ repositoryId, body }),
		deleteRepository: deleteRepositoryMutation.mutateAsync,
		refreshRepository: refreshRepositoryMutation.mutateAsync,
		isInstalling: installMutation.isPending,
		isUninstalling: uninstallMutation.isPending,
		isCreatingRepository: createRepositoryMutation.isPending,
		isUpdatingRepository: updateRepositoryMutation.isPending,
		isDeletingRepository: deleteRepositoryMutation.isPending,
		isRefreshingRepository: refreshRepositoryMutation.isPending,
	};
}
