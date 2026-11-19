import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "../../utils/toast-utils";
import { reelvault } from "../client";
import { emptyPagination, emptyToUndefined } from "../utils/query-helpers";
import { adminKeys } from "../utils/query-keys";

export function useAdminLogFiles() {
	const queryClient = useQueryClient();
	const query = useQuery({
		queryKey: adminKeys.logFiles(),
		queryFn: () => reelvault.admin.getLogFiles(),
		staleTime: 15_000,
		refetchInterval: (queryState) => (queryState.state.fetchFailureCount >= 3 ? false : 60_000),
		refetchIntervalInBackground: false,
	});

	const deleteMutation = useMutation({
		mutationFn: (fileId: string) => reelvault.admin.deleteLogFile(fileId),
		onSuccess: async (_, fileId) => {
			toast.success(m.hooks_log_file_deleted({ fileId }));
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: adminKeys.logFiles() }),
				queryClient.invalidateQueries({ queryKey: adminKeys.logsAll }),
			]);
		},
		onError: (err, fileId) => {
			toastError(m.hooks_log_file_delete_error({ fileId }), err);
		},
	});

	const cleanupMutation = useMutation({
		mutationFn: (retentionDays?: number) => reelvault.admin.cleanupLogs(retentionDays),
		onSuccess: async (result) => {
			toast.success(m.hooks_logs_cleanup_done({ deleted: result.deletedCount, scanned: result.scannedCount }));
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: adminKeys.logFiles() }),
				queryClient.invalidateQueries({ queryKey: adminKeys.logsAll }),
				queryClient.invalidateQueries({ queryKey: adminKeys.logCleanupPreview() }),
			]);
		},
		onError: (err) => {
			toastError(m.hooks_logs_cleanup_error(), err);
		},
	});

	return {
		files: query.data ?? [],
		isLoading: query.isLoading,
		isFetching: query.isFetching,
		error: query.error,
		refetch: query.refetch,
		deleteLogFile: deleteMutation.mutateAsync,
		isDeleting: deleteMutation.isPending,
		cleanupLogs: cleanupMutation.mutateAsync,
		isCleaningUp: cleanupMutation.isPending,
	};
}

interface UseAdminLogsParams {
	fileId?: string;
	level?: string;
	search?: string;
	module?: string;
	exclude?: string;
	from?: string;
	to?: string;
	page?: number;
	limit?: number;
}

export function useAdminLogs(params: UseAdminLogsParams = {}, autoRefresh = true) {
	const { fileId, level, search, module, exclude, from, to, page = 1, limit = 25 } = params;
	const effectiveLevel = level && level !== "all" ? level : undefined;

	const logsQuery = useQuery({
		queryKey: adminKeys.logs({ fileId, level: effectiveLevel, search, module, exclude, from, to, page, limit }),
		placeholderData: keepPreviousData,
		queryFn: () =>
			reelvault.admin.getLogs({
				fileId: emptyToUndefined(fileId),
				level: effectiveLevel,
				q: emptyToUndefined(search),
				module: emptyToUndefined(module),
				exclude: emptyToUndefined(exclude),
				from: emptyToUndefined(from),
				to: emptyToUndefined(to),
				limit,
				page,
			}),
		staleTime: 15_000,
		refetchInterval: autoRefresh ? (queryState) => (queryState.state.fetchFailureCount >= 3 ? false : 3000) : false,
	});

	const empty = emptyPagination(limit);

	return {
		logs: logsQuery.data?.data ?? [],
		total: logsQuery.data?.total ?? empty.total,
		totalPages: logsQuery.data?.totalPages ?? empty.totalPages,
		truncated: logsQuery.data?.truncated ?? false,
		windowBytes: logsQuery.data?.windowBytes ?? 0,
		isLoading: logsQuery.isLoading,
		isFetching: logsQuery.isFetching,
		error: logsQuery.error,
		refetch: logsQuery.refetch,
	};
}

/** What a log cleanup with the configured retention would remove right now. Nothing is removed. Read on each open. */
export function useLogCleanupPreview() {
	return useQuery({
		queryKey: adminKeys.logCleanupPreview(),
		queryFn: () => reelvault.admin.cleanupLogs(undefined, { dryRun: true }),
		staleTime: 0,
	});
}
