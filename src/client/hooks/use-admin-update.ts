import type { AdminUpdateStatus, AdminUpdateTarget } from "@reelvault/sdk";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "../../utils/toast-utils";
import { reelvault } from "../client";
import { adminKeys } from "../utils/query-keys";

/**
 * Human-readable labels for the states of a running update install job. Shared
 * by the updates page and the dashboard update card so the two stay in sync.
 */
export const UPDATE_JOB_STATE_LABELS: Record<string, () => string> = {
	downloading: m.admin_updates_job_downloading,
	verifying: m.admin_updates_job_verifying,
	extracting: m.admin_updates_job_extracting,
	swapping: m.admin_updates_job_swapping,
	restarting: m.admin_updates_job_restarting,
};

/** Install states that still allow a cancel: the files are not replaced yet. */
export const CANCELLABLE_UPDATE_JOB_STATES: ReadonlySet<string> = new Set(["downloading", "verifying", "extracting"]);

const UPDATE_HISTORY_PAGE_SIZE = 10;

/**
 * Installs and rollbacks, newest first. Polls only while a run is still marked
 * as running: a server run closes once the restarted server reports it.
 */
export function useAdminUpdateHistory(page: number) {
	return useQuery({
		queryKey: adminKeys.updateHistory(page, UPDATE_HISTORY_PAGE_SIZE),
		queryFn: () => reelvault.admin.getUpdateHistory({ page, limit: UPDATE_HISTORY_PAGE_SIZE }),
		placeholderData: keepPreviousData,
		refetchInterval: (query) => (query.state.data?.data.some((entry) => entry.status === "running") ? 2_000 : false),
		refetchIntervalInBackground: false,
		staleTime: 30_000,
	});
}

/**
 * Version + update status of the server and web UI. While an install job is
 * running the query polls every 2 s; the server disappears during the restart,
 * so the refetch failures in that window are expected and the UI shows the
 * "restarting" state instead.
 */
export function useAdminUpdate() {
	const queryClient = useQueryClient();

	const statusQuery = useQuery<AdminUpdateStatus>({
		queryKey: adminKeys.updateStatus(),
		queryFn: () => reelvault.admin.getUpdateStatus(),
		staleTime: 60_000,
		refetchInterval: (query) => (query.state.data?.job ? 2_000 : false),
		refetchIntervalInBackground: false,
	});

	const invalidate = async () => {
		await Promise.all([
			queryClient.invalidateQueries({ queryKey: adminKeys.updateStatus() }),
			queryClient.invalidateQueries({ queryKey: adminKeys.updateHistoryAll() }),
		]);
	};

	const checkNowMutation = useMutation({
		mutationFn: async () => {
			return await reelvault.admin.checkForUpdates();
		},
		onSuccess: (data) => {
			queryClient.setQueryData(adminKeys.updateStatus(), data);
			toast.success(m.toast_update_check_completed());
		},
		onError: (error) => {
			toastError(m.toast_update_check_failed(), error, m.toast_update_unexpected_error());
		},
	});

	const installMutation = useMutation({
		mutationFn: async (target: AdminUpdateTarget) => {
			return await reelvault.admin.installUpdate(target);
		},
		onSuccess: async () => {
			await invalidate();
			toast.success(m.toast_update_install_started());
		},
		onError: (error) => {
			toastError(m.toast_update_install_failed(), error, m.toast_update_unexpected_error());
		},
	});

	const cancelMutation = useMutation({
		mutationFn: async (target: AdminUpdateTarget) => {
			return await reelvault.admin.cancelUpdate(target);
		},
		onSuccess: async () => {
			await invalidate();
			toast.success(m.toast_update_cancel_requested());
		},
		onError: (error) => {
			toastError(m.toast_update_cancel_failed(), error, m.toast_update_unexpected_error());
		},
	});

	const rollbackMutation = useMutation({
		mutationFn: async (target: AdminUpdateTarget) => {
			return await reelvault.admin.rollbackUpdate(target);
		},
		onSuccess: async () => {
			await invalidate();
			toast.success(m.toast_update_rollback_started());
		},
		onError: (error) => {
			toastError(m.toast_update_rollback_failed(), error, m.toast_update_unexpected_error());
		},
	});

	return {
		status: statusQuery.data,
		statusQuery,
		checkNow: checkNowMutation.mutateAsync,
		isChecking: checkNowMutation.isPending,
		install: installMutation.mutateAsync,
		isInstalling: installMutation.isPending,
		rollback: rollbackMutation.mutateAsync,
		isRollingBack: rollbackMutation.isPending,
		cancel: cancelMutation.mutateAsync,
		isCancelling: cancelMutation.isPending,
	};
}
