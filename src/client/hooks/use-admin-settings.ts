import type { UpdateSystemSettings } from "@reelvault/sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "@/utils/toast-utils";
import { reelvault } from "../client";
import { adminKeys, adminSettingsKeys } from "../utils/query-keys";

export function useAdminSettings() {
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: adminSettingsKeys.list(),
		queryFn: () => reelvault.admin.getSystemSettings(),
		staleTime: 600_000,
	});

	const updateSettingsMutation = useMutation({
		mutationFn: async (updates: UpdateSystemSettings) => {
			return await reelvault.admin.updateSystemSettings(updates);
		},
		onSuccess: async (data) => {
			toast.success(m.hooks_server_settings_saved());
			queryClient.setQueryData(adminSettingsKeys.list(), data);
			// Changing ffmpeg.* (e.g. hwaccel) re-initializes capabilities on the server.
			await queryClient.invalidateQueries({ queryKey: adminKeys.ffmpegCapabilities() });
		},
		onError: (error) => {
			console.error("Failed to update settings", error);
			toastError(m.toast_settings_save_error(), error);
		},
	});

	const resetSettingsMutation = useMutation({
		mutationFn: async (keys?: string[]) => {
			return await reelvault.admin.resetSystemSettings(keys ? { keys } : {});
		},
		onSuccess: async (data) => {
			toast.success(m.toast_settings_restored());
			queryClient.setQueryData(adminSettingsKeys.list(), data);
			await queryClient.invalidateQueries({ queryKey: adminKeys.ffmpegCapabilities() });
		},
		onError: (error) => {
			console.error("Failed to reset settings", error);
			toastError(m.toast_settings_restore_error(), error);
		},
	});

	return {
		settings: query.data,
		isLoading: query.isLoading,
		isFetching: query.isFetching,
		error: query.error,
		refetch: query.refetch,
		updateSettings: updateSettingsMutation.mutateAsync,
		isUpdating: updateSettingsMutation.isPending,
		resetSettings: resetSettingsMutation.mutateAsync,
		isResetting: resetSettingsMutation.isPending,
	};
}
