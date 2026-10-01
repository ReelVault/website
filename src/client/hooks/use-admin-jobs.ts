import type { PurgeWorkerHistoryOptions, WorkerJob, WorkerOperation } from "@reelvault/sdk";
import type { QueryClient } from "@tanstack/react-query";
import { keepPreviousData, skipToken, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "../../utils/toast-utils";
import { reelvault } from "../client";
import { pollWhile } from "../utils/poll-while";
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
	const query = useQuery({
		queryKey: adminKeys.workerOperationJobs(operationId ?? "none", options),
		placeholderData: keepPreviousData,
		enabled: Boolean(operationId),
		queryFn: operationId ? () => reelvault.admin.getWorkerOperationJobs(operationId, options) : skipToken,
		staleTime: 15_000,
		refetchInterval: pollWhile({
			enabled: autoRefresh,
			isActive: (data) => data?.items.some((i: WorkerJob) => i.status === "pending" || i.status === "running") ?? false,
			activeMs: 5_000,
		}),
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
	};
}

export function useAdminActiveOperations(autoRefresh = true) {
	return useQuery({
		queryKey: adminKeys.workerOperations({ page: 1, limit: 50, status: "active" }),
		queryFn: () => reelvault.admin.getWorkerOperations({ page: 1, limit: 50, status: "active" }),
		staleTime: 5_000,
		// Fast while work is running; back off when empty so an idle admin page is
		// not polling every 3 s (a new operation is still noticed within 15 s).
		refetchInterval: pollWhile({
			enabled: autoRefresh,
			isActive: (data) => (data?.data.length ?? 0) > 0,
			activeMs: 3_000,
			idleMs: 15_000,
		}),
	});
}

/** Cancel/resume actions for a single worker operation, shared by every view that renders operation cards. */
export function useWorkerOperationActions() {
	const queryClient = useQueryClient();

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

	return {
		cancelOperation: cancelMutation.mutateAsync,
		cancellingOperationId: cancelMutation.isPending ? cancelMutation.variables : undefined,
		resumeOperation: resumeMutation.mutateAsync,
		resumingOperationId: resumeMutation.isPending ? resumeMutation.variables : undefined,
	};
}

export function useAdminJobs(
	operationId?: string,
	limit = 25,
	autoRefresh = true,
	status?: "pending" | "running" | "completed" | "failed" | "cancelled",
	page = 1,
) {
	const operationsQuery = useQuery({
		queryKey: adminKeys.workerOperations({ page, limit, status }),
		placeholderData: keepPreviousData,
		queryFn: () => reelvault.admin.getWorkerOperations({ page, limit, status }),
		staleTime: 15_000,
		refetchInterval: pollWhile({
			enabled: autoRefresh,
			isActive: (data) => data?.data.some((op: WorkerOperation) => ACTIVE_OPERATION_STATUSES.has(op.status)) ?? false,
			activeMs: 5_000,
		}),
	});

	const operationQuery = useQuery({
		queryKey: adminKeys.workerOperation(operationId ?? "none"),
		enabled: Boolean(operationId),
		queryFn: operationId ? () => reelvault.admin.getWorkerOperation(operationId) : skipToken,
		staleTime: 15_000,
		refetchInterval: pollWhile({
			enabled: autoRefresh,
			isActive: (data) => {
				const opStatus = data?.status;

				return Boolean(opStatus && !TERMINAL_OPERATION_STATUSES.has(opStatus));
			},
			activeMs: 5_000,
		}),
	});

	const operationItemsQuery = useQuery({
		queryKey: adminKeys.workerOperationJobs(operationId ?? "none"),
		enabled: Boolean(operationId),
		queryFn: operationId ? () => reelvault.admin.getWorkerOperationJobs(operationId) : skipToken,
		staleTime: 15_000,
		refetchInterval: pollWhile({
			enabled: autoRefresh,
			isActive: () => {
				const opStatus = operationQuery.data?.status;

				return Boolean(opStatus && !TERMINAL_OPERATION_STATUSES.has(opStatus));
			},
			activeMs: 5_000,
		}),
	});

	return {
		operations: operationsQuery.data?.data ?? [],
		total: operationsQuery.data?.total ?? 0,
		totalPages: operationsQuery.data?.totalPages ?? 1,
		page: operationsQuery.data?.page ?? page,
		limit: operationsQuery.data?.limit ?? limit,
		operationsQuery,
		operation: operationQuery.data,
		operationItems: operationItemsQuery.data?.items ?? [],
		operationJobs: operationItemsQuery.data?.items ?? [],
		operationItemsSummary: operationItemsQuery.data?.summary,
		operationJobsSummary: operationItemsQuery.data?.summary,
		operationQuery,
		operationItemsQuery,
		operationJobsQuery: operationItemsQuery,
		isRefetching: operationsQuery.isRefetching || operationQuery.isRefetching || operationItemsQuery.isRefetching,
		...useWorkerOperationActions(),
	};
}

/** Cancels every queued/running worker operation — the "stop the flood" button. */
export function useCancelAllWorkerOperations() {
	const queryClient = useQueryClient();

	return useMutation({
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
