import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { startTransition, useEffect, useRef, useState } from "react";
import type { MediaFileSorting, ReassignMediaFile, UpdateMediaFile } from "reelvault-sdk";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "@/utils/toast-utils";
import { reelvault } from "../client";
import { adminKeys, mediaKeys, mePlaybackKeys, metadataKeys } from "../utils/query-keys";

export type AdminMediaFileSortBy = NonNullable<MediaFileSorting["sortBy"]>;

const emptyToUndefined = (value: string | undefined): string | undefined => (value === "" ? undefined : value);

const TERMINAL_OPERATION_STATUSES = new Set(["completed", "failed", "cancelled"]);

interface UseAdminMediaFilesParams {
	page?: number;
	limit?: number;
	fileName?: string;
	sortBy?: AdminMediaFileSortBy;
	sortOrder?: "asc" | "desc";
}

export const adminMediaFilesQueryOptions = ({
	page = 1,
	limit = 20,
	fileName,
	sortBy = "updatedAt",
	sortOrder = "desc",
}: UseAdminMediaFilesParams = {}) => ({
	queryKey: mediaKeys.adminFiles({ page, limit, fileName, sortBy, sortOrder }),
	placeholderData: keepPreviousData,
	queryFn: () =>
		reelvault.media.getAll({
			page,
			limit,
			fileName: emptyToUndefined(fileName),
			sortBy,
			sortOrder,
		}),
	staleTime: 15_000,
});

export function useAdminMediaFiles(params: UseAdminMediaFilesParams = {}) {
	const queryClient = useQueryClient();
	const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
	const { page = 1 } = params;

	const { data, isLoading, isFetching, error, refetch } = useQuery(adminMediaFilesQueryOptions(params));

	const deleteMutation = useMutation({
		mutationFn: async (mediaFileId: string) => {
			setDeletingIds((prev) => new Set(prev).add(mediaFileId));
			await reelvault.media.delete(mediaFileId);
		},
		onSuccess: async (_, mediaFileId) => {
			toast.success(m.toast_media_file_deleted());
			queryClient.removeQueries({ queryKey: mediaKeys.file(mediaFileId) });
			queryClient.removeQueries({ queryKey: mediaKeys.adminFile(mediaFileId) });
			await queryClient.invalidateQueries({ queryKey: mediaKeys.adminFiles() });
		},
		onError: (err) => {
			toastError(m.user_failed_to_delete_file(), err);
		},
		onSettled: (_, __, mediaFileId) => {
			setDeletingIds((prev) => {
				const next = new Set(prev);
				next.delete(mediaFileId);

				return next;
			});
		},
	});

	return {
		mediaFiles: data?.data ?? [],
		total: data?.total ?? 0,
		totalPages: data?.totalPages ?? 0,
		currentPage: data?.page ?? page,
		isLoading,
		isFetching,
		error,
		refetch,
		deletingIds,
		deleteMediaFile: deleteMutation.mutateAsync,
	};
}

export function useAdminMediaFile(mediaFileId: string) {
	return useQuery({
		queryKey: mediaKeys.adminFile(mediaFileId),
		enabled: Boolean(mediaFileId),
		queryFn: () => reelvault.media.getById(mediaFileId),
		staleTime: 120_000,
	});
}

export function useAdminUpdateMediaFile() {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: ({ mediaFileId, body }: { mediaFileId: string; body: UpdateMediaFile }) => reelvault.media.update(mediaFileId, body),
		onSuccess: async (_, { mediaFileId }) => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: mediaKeys.adminFiles() }),
				queryClient.invalidateQueries({ queryKey: mediaKeys.adminFile(mediaFileId) }),
				queryClient.invalidateQueries({ queryKey: mediaKeys.file(mediaFileId) }),
			]);
			toast.success(m.hooks_changes_saved());
		},
		onError: (err) => {
			toastError(m.toast_media_save_failed(), err);
		},
	});

	return {
		updateMediaFile: mutation.mutateAsync,
		isUpdating: mutation.isPending,
	};
}

export function useAdminRefreshMediaFile() {
	const queryClient = useQueryClient();
	const [refreshState, setRefreshState] = useState<{
		operationId?: string;
		mediaFileId?: string;
	}>({});
	const completedOperationRef = useRef<string | null>(null);

	const mutation = useMutation({
		mutationFn: (mediaFileId: string) => reelvault.media.refresh(mediaFileId),
		onSuccess: async (operation, mediaFileId) => {
			setRefreshState({
				operationId: operation.operationId,
				mediaFileId,
			});
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: mediaKeys.adminFiles() }),
				queryClient.invalidateQueries({ queryKey: mediaKeys.adminFile(mediaFileId) }),
				queryClient.invalidateQueries({ queryKey: mediaKeys.file(mediaFileId) }),
			]);
			toast.success(m.toast_media_refresh_scheduled());
		},
		onError: (err) => {
			toastError(m.toast_media_refresh_schedule_failed(), err);
		},
	});
	const operationQuery = useQuery({
		queryKey: adminKeys.workerOperation(refreshState.operationId ?? "none"),
		enabled: Boolean(refreshState.operationId),
		queryFn: () => reelvault.admin.getWorkerOperation(refreshState.operationId ?? ""),
		staleTime: 15_000,
		refetchInterval: (query) => {
			const status = query.state.data?.status;

			return status && TERMINAL_OPERATION_STATUSES.has(status) ? false : 2_000;
		},
	});
	useEffect(() => {
		if (!(refreshState.operationId && operationQuery.data) || completedOperationRef.current === refreshState.operationId) return;

		const opStatus = operationQuery.data.status;
		if (opStatus === "completed") {
			completedOperationRef.current = refreshState.operationId;
			// Transition keeps the post-refresh invalidation refetches non-blocking.
			startTransition(async () => {
				await Promise.all([
					queryClient.invalidateQueries({ queryKey: mediaKeys.adminFile(refreshState.mediaFileId ?? "") }),
					queryClient.invalidateQueries({ queryKey: mediaKeys.file(refreshState.mediaFileId ?? "") }),
					queryClient.invalidateQueries({ queryKey: mePlaybackKeys.progressAll() }),
					queryClient.invalidateQueries({ queryKey: mePlaybackKeys.continueWatching() }),
				]);
			});
			toast.success(m.toast_media_info_refreshed());
		}

		if (opStatus === "failed" || opStatus === "cancelled") {
			completedOperationRef.current = refreshState.operationId;
			toast.error(opStatus === "failed" ? m.toast_media_refresh_failed() : m.toast_media_refresh_cancelled());
		}
	}, [refreshState.operationId, refreshState.mediaFileId, operationQuery.data, queryClient]);

	return {
		refreshMediaFile: mutation.mutateAsync,
		isRefreshing: mutation.isPending,
		refreshStatus: operationQuery.data?.status,
	};
}

export function useAdminRefreshAllMediaFiles() {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: () => reelvault.media.refreshAll(),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: mediaKeys.adminFiles() });
			toast.success(m.toast_media_all_refresh_scheduled());
		},
		onError: (err) => toastError(m.toast_media_bulk_refresh_failed(), err),
	});

	return { refreshAllMediaFiles: mutation.mutateAsync, isRefreshingAll: mutation.isPending };
}

export function useAdminScanMediaFile() {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: ({ mediaFileId, durationSeconds }: { mediaFileId: string; durationSeconds?: number | null }) =>
			reelvault.media.scan(mediaFileId, { durationSeconds }),
		onSuccess: async (_, { mediaFileId }) => {
			toast.success(m.toast_media_scan_finished());
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: mediaKeys.adminFiles() }),
				queryClient.invalidateQueries({ queryKey: mediaKeys.adminFile(mediaFileId) }),
				queryClient.invalidateQueries({ queryKey: mediaKeys.file(mediaFileId) }),
			]);
		},
		onError: (err) => {
			toastError(m.toast_media_scan_error(), err);
		},
	});

	return {
		scanMediaFile: mutation.mutateAsync,
		isScanning: mutation.isPending,
		scanResult: mutation.data,
		resetScan: mutation.reset,
	};
}

export function useAdminReassignMediaFile() {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: ({ mediaFileId, body }: { mediaFileId: string; body: ReassignMediaFile }) => reelvault.media.reassign(mediaFileId, body),
		onSuccess: async (_, { mediaFileId, body }) => {
			const invalidations = [
				// The media-files family (by-metadata / by-episode / details-modal)
				// holds the old + new relations; mediaKeys.all never touched it.
				queryClient.invalidateQueries({ queryKey: mediaKeys.files() }),
				queryClient.invalidateQueries({ queryKey: mediaKeys.adminFiles() }),
				queryClient.invalidateQueries({ queryKey: mediaKeys.adminFile(mediaFileId) }),
				queryClient.invalidateQueries({ queryKey: mediaKeys.file(mediaFileId) }),
				queryClient.invalidateQueries({ queryKey: mePlaybackKeys.progressAll() }),
				queryClient.invalidateQueries({ queryKey: mePlaybackKeys.continueWatching() }),
				queryClient.invalidateQueries({ queryKey: mePlaybackKeys.streamPrefs(mediaFileId) }),
			];
			if (body.targetMetadataId) {
				invalidations.push(queryClient.invalidateQueries({ queryKey: metadataKeys.detailsView(body.targetMetadataId) }));
			}

			await Promise.all(invalidations);
			toast.success(m.toast_media_assignment_changed());
		},
		onError: (err) => {
			console.error("Reassign media file failed:", err);
			toastError(m.toast_media_assignment_change_failed(), err);
		},
	});

	return {
		reassignMediaFile: mutation.mutateAsync,
		isReassigning: mutation.isPending,
	};
}

export function useAdminMediaFileAudit() {
	const [operationId, setOperationId] = useState<string | null>(null);

	// The endpoint is queued (202): start the run, then poll its status until terminal.
	const startMutation = useMutation({
		mutationFn: () => reelvault.media.getAudit(),
		onSuccess: (operation) => setOperationId(operation.operationId),
		onError: (err) => {
			toastError(m.admin_audit_failed_to_fetch(), err);
		},
	});
	const { mutate: startAudit } = startMutation;

	useEffect(() => {
		startAudit();
	}, [startAudit]);

	const statusQuery = useQuery({
		queryKey: mediaKeys.audit(operationId ?? undefined),
		enabled: Boolean(operationId),
		queryFn: () => reelvault.media.getAuditStatus(operationId ?? ""),
		staleTime: 0,
		refetchInterval: (query) => {
			const status = query.state.data?.status;

			return status && TERMINAL_OPERATION_STATUSES.has(status) ? false : 2_000;
		},
	});

	const result = statusQuery.data?.result ?? null;
	const isRunning = Boolean(operationId) && !(statusQuery.data && TERMINAL_OPERATION_STATUSES.has(statusQuery.data.status));

	return {
		auditData: result ?? undefined,
		totalFilesChecked: result?.totalFilesChecked ?? 0,
		suspectCount: result?.suspectCount ?? 0,
		suspects: result?.suspects ?? [],
		isLoading: operationId ? statusQuery.isLoading : startMutation.isPending,
		isFetching: startMutation.isPending || isRunning,
		isRunning,
		error: startMutation.error ?? statusQuery.error,
		refetch: () => startAudit(),
	};
}
