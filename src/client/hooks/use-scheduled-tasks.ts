import type { TaskTrigger, WorkerCategory } from "@reelvault/sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "../../utils/toast-utils";
import { reelvault } from "../client";
import { adminKeys } from "../utils/query-keys";
import { invalidateWorkerQueries } from "./use-admin-jobs";

export function useScheduledTasks(autoRefresh = true) {
	const queryClient = useQueryClient();

	const scheduledTasksQuery = useQuery({
		queryKey: adminKeys.workers(),
		queryFn: () => reelvault.admin.getWorkers(),
		staleTime: 15_000,
		refetchInterval: autoRefresh ? 5_000 : false,
	});

	const runTaskMutation = useMutation({
		mutationFn: (params: string | { workerId: string; data?: unknown }) => {
			const workerId = typeof params === "string" ? params : params.workerId;
			const data = typeof params === "string" ? undefined : params.data;

			return reelvault.admin.runWorker(workerId, data);
		},
		onError: (error) => {
			toastError(m.toast_job_start_failed(), error, m.toast_plugins_unexpected_error());
		},
		onSuccess: async () => {
			await invalidateWorkerQueries(queryClient);
		},
	});

	const runCategoryMutation = useMutation({
		mutationFn: (category: WorkerCategory) => reelvault.admin.runWorkerCategory(category),
		onError: (error) => {
			toastError(m.toast_job_start_failed(), error, m.toast_plugins_unexpected_error());
		},
		onSuccess: async (data) => {
			if (data.started.length > 0) {
				toast.success(m.admin_workers_run_all_started({ started: data.started.length }));
			}

			if (data.skipped.length > 0) {
				toast.info(m.admin_workers_run_all_skipped({ count: data.skipped.length }));
			}

			await invalidateWorkerQueries(queryClient);
		},
	});

	const cancelTaskMutation = useMutation({
		mutationFn: (workerId: string) => reelvault.admin.cancelWorker(workerId),
		onError: (error) => {
			toastError(m.toast_job_cancel_failed(), error, m.toast_plugins_unexpected_error());
		},
		onSuccess: async (data) => {
			if (data.cancelledCount > 0) {
				toast.info(m.hooks_tasks_cancelled_count({ count: data.cancelledCount }));
			}

			await invalidateWorkerQueries(queryClient);
		},
	});

	const cancelAllMutation = useMutation({
		mutationFn: () => reelvault.admin.cancelAllWorkers(),
		onError: (error) => {
			toastError(m.toast_tasks_cancel_failed(), error, m.toast_plugins_unexpected_error());
		},
		onSuccess: async (data) => {
			toast.info(m.hooks_all_pending_cancelled({ count: data.cancelledCount }));
			await invalidateWorkerQueries(queryClient);
		},
	});

	const updateTriggersMutation = useMutation({
		mutationFn: ({ taskId, triggers }: { taskId: string; triggers: TaskTrigger[] }) =>
			reelvault.admin.updateWorkerTriggers(taskId, triggers),
		onError: (error) => {
			toastError(m.toast_schedule_update_failed(), error, m.toast_plugins_unexpected_error());
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: adminKeys.workers() });
		},
	});

	const runningVariables = runTaskMutation.variables;
	let runningTaskId: string | undefined;
	if (runTaskMutation.isPending) {
		runningTaskId = typeof runningVariables === "string" ? runningVariables : runningVariables?.workerId;
	}

	return {
		tasks: scheduledTasksQuery.data ?? [],
		workers: scheduledTasksQuery.data ?? [],
		isLoading: scheduledTasksQuery.isLoading,
		isError: scheduledTasksQuery.isError,
		isRefetching: scheduledTasksQuery.isRefetching,
		refetch: scheduledTasksQuery.refetch,
		runTask: runTaskMutation.mutateAsync,
		runningTaskId,
		runCategory: runCategoryMutation.mutateAsync,
		runningCategoryId: runCategoryMutation.isPending ? runCategoryMutation.variables : undefined,
		cancelTask: cancelTaskMutation.mutateAsync,
		cancellingTaskId: cancelTaskMutation.isPending ? cancelTaskMutation.variables : undefined,
		cancelAllWorkers: cancelAllMutation.mutateAsync,
		isCancellingAll: cancelAllMutation.isPending,
		updateTriggers: updateTriggersMutation.mutateAsync,
		isUpdatingTriggers: updateTriggersMutation.isPending,
	};
}
