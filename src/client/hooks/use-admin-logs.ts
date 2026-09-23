import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "../../utils/toast-utils";
import { reelvault } from "../client";
import { emptyPagination } from "../utils/query-helpers";
import { adminKeys } from "../utils/query-keys";

const emptyToUndefined = (value: string | undefined): string | undefined => (value === "" ? undefined : value);

export function useAdminLogFiles() {
	const queryClient = useQueryClient();
	const query = useQuery({
		queryKey: adminKeys.logFiles(),
		queryFn: () => reelvault.admin.getLogFiles(),
		staleTime: 15_000,
		refetchInterval: 60_000,
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
	page?: number;
	limit?: number;
}

export function useAdminLogs(params: UseAdminLogsParams = {}, autoRefresh = true) {
	const { fileId, level, search, page = 1, limit = 25 } = params;
	const effectiveLevel = level && level !== "all" ? level : undefined;

	const query = useQuery({
		queryKey: adminKeys.logs({ fileId, level: effectiveLevel, search, page, limit }),
		placeholderData: keepPreviousData,
		queryFn: () =>
			reelvault.admin.getLogs({
				fileId: emptyToUndefined(fileId),
				level: effectiveLevel,
				search: emptyToUndefined(search),
				limit,
				page,
			}),
		staleTime: 15_000,
		refetchInterval: autoRefresh ? 3000 : false,
	});

	return {
		logs: query.data?.data ?? [],
		pagination: query.data?.pagination ?? emptyPagination(limit),
		isLoading: query.isLoading,
		isFetching: query.isFetching,
		error: query.error,
		refetch: query.refetch,
	};
}
