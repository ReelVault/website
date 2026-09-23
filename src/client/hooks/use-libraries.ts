import type { MetadataType } from "@reelvault/sdk";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "../../utils/toast-utils";
import { reelvault } from "../client";
import { libraryDetailFields, libraryListFields } from "../utils/fields";
import { libraryKeys } from "../utils/query-keys";

export const librariesQueryOptions = (type: "movies" | "tv_shows") =>
	queryOptions({
		queryKey: libraryKeys.list(type),
		queryFn: () => reelvault.libraries.getAll({ type, fields: libraryListFields }),
		staleTime: Number.POSITIVE_INFINITY,
	});

export const libraryDetailQueryOptions = (id: string) =>
	queryOptions({
		queryKey: libraryKeys.detail(id),
		queryFn: () => reelvault.libraries.getById(id, { fields: libraryDetailFields }),
		staleTime: 1000 * 60 * 10,
	});

export function useLibrariesQuery(type: "movies" | "tv_shows") {
	return useQuery(librariesQueryOptions(type));
}

export function useLibraryData(id: string, type: MetadataType) {
	const libraryType = type === "movie" ? "movies" : "tv_shows";
	const queryClient = useQueryClient();

	const allLibrariesQuery = useQuery(librariesQueryOptions(libraryType));
	const allLibraries = allLibrariesQuery.data?.data ?? [];

	const libraryQuery = useQuery({
		...libraryDetailQueryOptions(id),
		initialData: (): { id: string; name: string; type: "movies" | "tv_shows" } | undefined => {
			const cachedLibs = queryClient.getQueryData(librariesQueryOptions(libraryType).queryKey);
			const found = cachedLibs?.data.find((lib) => lib.id === id);

			return found ? { id: found.id, type: libraryType, name: found.name } : undefined;
		},
		initialDataUpdatedAt: () => queryClient.getQueryState(librariesQueryOptions(libraryType).queryKey)?.dataUpdatedAt,
	});

	// TanStack types the query data as always present because initialData is set,
	// but the initialData callback can legitimately return undefined before the
	// cache is warm — read it through an honestly-typed accessor so the fallback
	// below keeps working.
	const getCachedLibrary = (): (typeof allLibraries)[number] | undefined => libraryQuery.data;
	const currentLibrary = getCachedLibrary() ?? allLibraries.find((l) => l.id === id);

	// Reads through a boolean-annotated accessor: TanStack types isLoading for an
	// initialData-backed query as literal false, but at runtime the initial data
	// can be absent (callback returned undefined) and loading is real.
	const loadingFlags: boolean[] = [libraryQuery.isLoading, allLibrariesQuery.isLoading];
	const getIsLoading = (): boolean => !currentLibrary && loadingFlags.some((flag) => flag);

	return {
		library: currentLibrary,
		allLibraries,
		isLoading: getIsLoading(),
		error: libraryQuery.error ?? allLibrariesQuery.error,
		refetch: () => Promise.all([libraryQuery.refetch(), allLibrariesQuery.refetch()]),
	};
}

export function useAdminLibraries() {
	const queryClient = useQueryClient();
	const librariesQuery = useQuery({
		queryKey: libraryKeys.admin(),
		queryFn: () => reelvault.libraries.getAll(),
	});

	const invalidateLibraries = () => queryClient.invalidateQueries({ queryKey: libraryKeys.all });
	const deleteMutation = useMutation({
		mutationFn: (id: string) => reelvault.libraries.delete(id),
		onSuccess: async (_, id) => {
			queryClient.removeQueries({ queryKey: libraryKeys.detail(id) });
			queryClient.removeQueries({ queryKey: libraryKeys.ignoreAssets(id) });
			queryClient.removeQueries({ queryKey: libraryKeys.scanFindings(id) });
			await invalidateLibraries();
			toast.success(m.toast_library_deleted());
		},
		onError: (error) => {
			console.error("Failed to delete library", error);
			toastError(m.toast_library_delete_error(), error);
		},
	});
	const scanMutation = useMutation({
		mutationFn: (id: string) => reelvault.libraries.scan(id),
		onSuccess: async () => {
			await invalidateLibraries();
			toast.success(m.toast_library_scan_started());
		},
		onError: (error) => {
			console.error("Failed to scan library", error);
			toastError(m.toast_scan_start_error(), error);
		},
	});
	const scanAllMutation = useMutation({
		mutationFn: async () => {
			const libs = librariesQuery.data?.data ?? [];
			if (libs.length === 0) return { queued: 0, total: 0 };

			// Rate limit dzieli bucket między biblioteki — pojedyncze odrzucenie
			// nie może uciszyć całego scan-all ani zgubić pozostałych kolejek.
			const results = await Promise.allSettled(libs.map((lib) => reelvault.libraries.scan(lib.id)));

			return { queued: results.filter((r) => r.status === "fulfilled").length, total: libs.length };
		},
		onSuccess: async ({ queued, total }) => {
			await invalidateLibraries();
			if (queued === total) {
				toast.success(m.toast_all_libraries_scan_started());
			} else {
				toast.warning(`${m.toast_all_libraries_scan_started()} (${queued}/${total})`);
			}
		},
		onError: (error) => {
			console.error("Failed to scan all libraries", error);
			toastError(m.toast_scan_start_error(), error);
		},
	});
	const scanPathMutation = useMutation({
		mutationFn: ({ libraryId, pathId }: { libraryId: string; pathId: string }) => reelvault.libraries.scanPath(libraryId, pathId),
		onSuccess: async () => {
			await invalidateLibraries();
			toast.success(m.toast_path_scan_started());
		},
		onError: (error) => {
			console.error("Failed to scan library path", error);
			toastError(m.toast_path_scan_start_error(), error);
		},
	});
	const createMutation = useMutation({
		mutationFn: (data: Parameters<typeof reelvault.libraries.create>[0]) => reelvault.libraries.create(data),
		onSuccess: async () => {
			await invalidateLibraries();
			toast.success(m.toast_library_created());
		},
		onError: (error) => {
			console.error("Failed to create library", error);
			toastError(m.toast_library_create_error(), error);
		},
	});
	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: Parameters<typeof reelvault.libraries.update>[1] }) =>
			reelvault.libraries.update(id, data),
		onSuccess: async () => {
			await invalidateLibraries();
			toast.success(m.toast_library_updated());
		},
		onError: (error) => {
			console.error("Failed to update library", error);
			toastError(m.toast_library_update_error(), error);
		},
	});

	return {
		libraries: librariesQuery.data?.data ?? [],
		total: librariesQuery.data?.total ?? 0,
		isLoading: librariesQuery.isLoading,
		error: librariesQuery.error,
		refetch: librariesQuery.refetch,
		deleteLibrary: deleteMutation.mutateAsync,
		isDeleting: deleteMutation.isPending,
		scanLibrary: scanMutation.mutateAsync,
		isScanning: scanMutation.isPending,
		scanAllLibraries: scanAllMutation.mutateAsync,
		isScanningAll: scanAllMutation.isPending,
		scanLibraryPath: scanPathMutation.mutateAsync,
		isScanningPath: scanPathMutation.isPending,
		createLibrary: createMutation.mutateAsync,
		isCreating: createMutation.isPending,
		updateLibrary: updateMutation.mutateAsync,
		isUpdating: updateMutation.isPending,
		deleteStatus: deleteMutation.status,
		scanStatus: scanMutation.status,
		mutationVariables: { delete: deleteMutation.variables, scan: scanMutation.variables, scanPath: scanPathMutation.variables },
	};
}

export function useCheckLibraryErrors() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (libraryPaths: string[]) => reelvault.libraries.checkErrors(libraryPaths),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: libraryKeys.admin() });
			toast.success(m.toast_library_error_check_scheduled());
		},
		onError: (error) => {
			toastError(m.toast_library_error_check_failed(), error);
		},
	});
}

export function useLibraryIgnoredAssets(libraryId: string, enabled: boolean) {
	return useQuery({
		queryKey: libraryKeys.ignoreAssets(libraryId),
		queryFn: () => reelvault.libraries.getIgnoredAssets(libraryId),
		enabled,
		staleTime: 60_000,
	});
}

export function useLibraryScanFindings(libraryId: string, enabled: boolean) {
	return useQuery({
		queryKey: libraryKeys.scanFindings(libraryId),
		queryFn: () => reelvault.libraries.getScanFindings(libraryId),
		enabled,
		staleTime: 60_000,
	});
}
