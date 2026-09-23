import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PluginConfigDetails } from "reelvault-sdk";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "../../utils/toast-utils";
import { reelvault } from "../client";
import { adminKeys } from "../utils/query-keys";

export function useAdminPluginConfig(pluginId: string) {
	const queryClient = useQueryClient();

	const configQuery = useQuery<PluginConfigDetails>({
		queryKey: adminKeys.pluginConfig(pluginId),
		queryFn: async () => {
			return await reelvault.admin.getPluginConfig(pluginId);
		},
		enabled: Boolean(pluginId),
	});

	const updateMutation = useMutation({
		mutationFn: async (updatedValues: Record<string, unknown>) => {
			return await reelvault.admin.updatePluginConfig(pluginId, updatedValues);
		},
		onSuccess: async (data) => {
			queryClient.setQueryData(adminKeys.pluginConfig(pluginId), data);
			await queryClient.invalidateQueries({ queryKey: adminKeys.plugins() });
			toast.success(m.toast_plugin_config_saved(), {
				description: m.toast_plugin_updated_reloaded(),
			});
		},
		onError: (err) => {
			toastError(m.toast_plugin_config_save_failed(), err);
		},
	});

	return {
		configDetails: configQuery.data,
		isLoading: configQuery.isLoading,
		isError: configQuery.isError,
		error: configQuery.error,
		refetch: configQuery.refetch,
		updateConfig: updateMutation.mutateAsync,
		isUpdating: updateMutation.isPending,
	};
}
