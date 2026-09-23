import type { QueryClient } from "@tanstack/react-query";
import { keepPreviousData, skipToken, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PurgeWorkerHistoryOptions, WorkerJob, WorkerOperation } from "@reelvault/sdk";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "../../utils/toast-utils";
import { reelvault } from "../client";
import { adminKeys } from "../utils/query-keys";

const ACTIVE_OPERATION_STATUSES = new Set(["pending", "running", "queued"]);
const TERMINAL_OPERATION_STATUSES = new Set(["completed", "failed", "cancelled"]);

export function invalidateWorkerQueries(queryClient: QueryClient, operationId?: string) {
	return Promise.all([
		queryClient.invalidateQueries({ queryKey: adminKeys.workerOperations() }),
		operationId ? queryClient.invalidateQueries({ queryKey: adminKeys.workerOperation(operationId) }) : Promise.resolve(),
		operationId ? queryClient.invalidateQueries({ queryKey: adminKeys.workerOperationJobs(operationId) }) : Promise.resolve(),
		queryClient.invalidateQueries({ queryKey: adminKeys.workers() }),
	]);
}

export function useAdminOperationJobs(
	operationId?: string,
	options: {
		page?: number;
		limit?: number;
		status?: "pending" | "running" | "completed" | "failed" | "cancelled";
		search?: string;
	} = {},
	autoRefresh = true,
) {
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: adminKeys.workerOperationJobs(operationId ?? "none", options),
		placeholderData: keepPreviousData,
		enabled: Boolean(operationId),
		queryFn: operationId ? () => reelvault.admin.getWorkerOperationJobs(operationId, options) : skipToken,
		staleTime: 15_000,
		refetchInterval: (q) => {
			if (!autoRefresh) return false;

			const hasActive = q.state.data?.items.some((i: WorkerJob) => i.status === "pending" || i.status === "running");

			return hasActive ? 5_000 : false;
		},
	});

	const cancelJobMutation = useMutation({
		mutationFn: (jobId: string) => reelvault.admin.cancelWorkerJob(jobId),
		onSuccess: async () => {
			if (operationId) {
				await Promise.all([
					queryClient.invalidateQueries({ queryKey: adminKeys.workerOperationJobs(operationId) }),
					queryClient.invalidateQueries({ queryKey: adminKeys.workerOperation(operationId) }),
				]);
			}

			await invalidateWorkerQueries(queryClient);
		},
		onError: (error) => {
			toastError(m.toast_job_cancel_failed(), error);
		},
	});

	return {
		items: query.data?.items ?? [],
		summary: query.data?.summary ?? { total: 0, pending: 0, running: 0, completed: 0, failed: 0, cancelled: 0 },
		total: query.data?.total ?? 0,
		totalPages: query.data?.totalPages ?? 0,
		page: query.data?.page ?? 1,
		limit: query.data?.limit ?? 50,
		query,
		isLoading: query.isLoading,
		isFetching: query.isFetching,
		isError: query.isError,
		refetch: query.refetch,
		cancelJob: cancelJobMutation.mutateAsync,
		cancelItem: cancelJobMutation.mutateAsync,
		cancellingJobId: cancelJobMutation.isPending ? cancelJobMutation.variables : undefined,
		cancellingItemId: cancelJobMutation.isPending ? cancelJobMutation.variables : undefined,
	};
}

export function useAdminActiveOperations(autoRefresh = true) {
	return useQuery({
		queryKey: adminKeys.workerOperations({ page: 1, limit: 50, status: "active" }),
		queryFn: () => reelvault.admin.getWorkerOperations({ page: 1, limit: 50, status: "active" }),
		staleTime: 5_000,
		// Fast while work is running; back off when empty so an idle admin page is
		// not polling every 3 s (a new operation is still noticed within 15 s).
		refetchInterval: (query) => {
			if (!autoRefresh) return false;

			const hasActive = (query.state.data?.data.length ?? 0) > 0;

			return hasActive ? 3_000 : 15_000;
		},
	});
}

export function useAdminJobs(
	operationId?: string,
	limit = 25,
	autoRefresh = true,
	status?: "pending" | "running" | "completed" | "failed" | "cancelled",
	page = 1,
) {
	const queryClient = useQueryClient();

	const operationsQuery = useQuery({
		queryKey: adminKeys.workerOperations({ page, limit, status }),
		placeholderData: keepPreviousData,
		queryFn: () => reelvault.admin.getWorkerOperations({ page, limit, status }),
		staleTime: 15_000,
		refetchInterval: (query) => {
			if (!autoRefresh) return false;

			const hasActive = query.state.data?.data.some((op: WorkerOperation) => ACTIVE_OPERATION_STATUSES.has(op.status));

			return hasActive ? 5_000 : false;
		},
	});

	const operationQuery = useQuery({
		queryKey: adminKeys.workerOperation(operationId ?? "none"),
		enabled: Boolean(operationId),
		queryFn: operationId ? () => reelvault.admin.getWorkerOperation(operationId) : skipToken,
		staleTime: 15_000,
		refetchInterval: (query) => {
			const opStatus = query.state.data?.status;

			return autoRefresh && opStatus && !TERMINAL_OPERATION_STATUSES.has(opStatus) ? 5_000 : false;
		},
	});

	const operationItemsQuery = useQuery({
		queryKey: adminKeys.workerOperationJobs(operationId ?? "none"),
		enabled: Boolean(operationId),
		queryFn: operationId ? () => reelvault.admin.getWorkerOperationJobs(operationId) : skipToken,
		staleTime: 15_000,
		refetchInterval: () => {
			const opStatus = operationQuery.data?.status;

			return autoRefresh && opStatus && !TERMINAL_OPERATION_STATUSES.has(opStatus) ? 5_000 : false;
		},
	});

	const statsQuery = useQuery({
		queryKey: adminKeys.workers(),
		queryFn: () => reelvault.admin.getWorkers(),
		staleTime: 15_000,
		refetchInterval: (query) => {
			if (!autoRefresh) return false;

			const hasBusyWorker = query.state.data?.some((w) => w.stats.active > 0 || w.stats.waiting > 0);

			return hasBusyWorker ? 5_000 : false;
		},
	});

	const cancelMutation = useMutation({
		mutationFn: (id: string) => reelvault.admin.cancelWorkerOperation(id),
		onSuccess: async (_, id) => {
			await invalidateWorkerQueries(queryClient, id);
		},
		onError: (error) => {
			toastError(m.toast_operation_cancel_failed(), error);
		},
	});

	const resumeMutation = useMutation({
		mutationFn: (id: string) => reelvault.admin.resumeWorkerOperation(id),
		onSuccess: async (data, id) => {
			toast.success(m.toast_operation_resumed({ count: data.resumed }));
			await invalidateWorkerQueries(queryClient, id);
		},
		onError: (error) => {
			toastError(m.toast_operation_resume_failed(), error);
		},
	});

	const cancelAllOperationsMutation = useMutation({
		mutationFn: () => reelvault.admin.cancelAllWorkerOperations(),
		onSuccess: async (data) => {
			if (data.cancelledCount > 0) {
				toast.info(m.hooks_jobs_cancelled_count({ count: data.cancelledCount }));
			} else {
				toast.info(m.hooks_no_active_operations());
			}

			await invalidateWorkerQueries(queryClient);
		},
		onError: (error) => {
			toastError(m.toast_operation_cancel_failed_short(), error);
		},
	});

	return {
		operations: operationsQuery.data?.data ?? [],
		total: operationsQuery.data?.total ?? 0,
		totalPages: operationsQuery.data?.totalPages ?? 1,
		page: operationsQuery.data?.page ?? page,
		limit: operationsQuery.data?.limit ?? limit,
		stats: statsQuery.data ?? [],
		operationsQuery,
		operation: operationQuery.data,
		operationItems: operationItemsQuery.data?.items ?? [],
		operationJobs: operationItemsQuery.data?.items ?? [],
		operationItemsSummary: operationItemsQuery.data?.summary,
		operationJobsSummary: operationItemsQuery.data?.summary,
		operationQuery,
		operationItemsQuery,
		operationJobsQuery: operationItemsQuery,
		statsQuery,
		isRefetching:
			operationsQuery.isRefetching || operationQuery.isRefetching || operationItemsQuery.isRefetching || statsQuery.isRefetching,
		cancelOperation: cancelMutation.mutateAsync,
		cancellingOperationId: cancelMutation.isPending ? cancelMutation.variables : undefined,
		resumeOperation: resumeMutation.mutateAsync,
		resumingOperationId: resumeMutation.isPending ? resumeMutation.variables : undefined,
		cancelAllOperations: cancelAllOperationsMutation.mutateAsync,
		isCancellingAllOperations: cancelAllOperationsMutation.isPending,
	};
}

export function usePurgeWorkerHistory() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (options?: PurgeWorkerHistoryOptions) => reelvault.admin.purgeWorkerHistory(options),
		onSuccess: async (data) => {
			toast.success(m.hooks_history_cleared_full({ operations: data.deletedOperationsCount, jobs: data.deletedJobsCount }));
			await invalidateWorkerQueries(queryClient);
		},
		onError: (error) => {
			toastError(m.plugins_webhooks_clear_failed(), error);
		},
	});
}
