import type { PluginConfigDetails, PluginConfigExport } from "@reelvault/sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

	// Reset and import replace the stored configuration, so both refresh the form from the server's answer.
	const applyServerConfig = async (data: PluginConfigDetails) => {
		queryClient.setQueryData(adminKeys.pluginConfig(pluginId), data);
		await queryClient.invalidateQueries({ queryKey: adminKeys.plugins() });
	};

	const updateMutation = useMutation({
		mutationFn: async (updatedValues: Record<string, unknown>) => {
			return await reelvault.admin.updatePluginConfig(pluginId, updatedValues);
		},
		onSuccess: async (data) => {
			await applyServerConfig(data);
			toast.success(m.toast_plugin_config_saved(), {
				description: m.toast_plugin_updated_reloaded(),
			});
		},
		onError: (err) => {
			toastError(m.toast_plugin_config_save_failed(), err);
		},
	});

	/** Restores the defaults for `keys`, or for every stored value when omitted. */
	const resetMutation = useMutation({
		mutationFn: async (keys?: string[]) => {
			return await reelvault.admin.resetPluginConfig(pluginId, keys ? { keys } : {});
		},
		onSuccess: async (data) => {
			await applyServerConfig(data);
			toast.success(m.admin_plugins_config_reset_done());
		},
		onError: (err) => {
			toastError(m.admin_plugins_config_reset_failed(), err);
		},
	});

	const importMutation = useMutation({
		mutationFn: async (exported: PluginConfigExport) => {
			return await reelvault.admin.importPluginConfig(pluginId, exported);
		},
		onSuccess: async (data) => {
			await applyServerConfig(data);
			toast.success(m.admin_plugins_config_import_done());
		},
		onError: (err) => {
			toastError(m.admin_plugins_config_import_failed(), err);
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
		resetConfig: resetMutation.mutateAsync,
		isResetting: resetMutation.isPending,
		importConfig: importMutation.mutateAsync,
		isImporting: importMutation.isPending,
		exportConfig: async () => await reelvault.admin.exportPluginConfig(pluginId),
	};
}
