import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PluginRuntimeStatus } from "reelvault-sdk";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "../../utils/toast-utils";
import { reelvault } from "../client";
import { adminKeys, pluginKeys } from "../utils/query-keys";

export function useAdminPlugins() {
	const queryClient = useQueryClient();

	const pluginsQuery = useQuery<PluginRuntimeStatus[]>({
		queryKey: adminKeys.plugins(),
		queryFn: async () => {
			return await reelvault.admin.getPlugins();
		},
		staleTime: 600_000,
	});

	const reloadAllMutation = useMutation({
		mutationFn: async () => {
			return await reelvault.admin.reloadPlugins();
		},
		onSuccess: async (data) => {
			queryClient.setQueryData(adminKeys.plugins(), data);
			await queryClient.invalidateQueries({ queryKey: pluginKeys.all });
			toast.success(m.toast_all_plugins_reloaded());
		},
		onError: (error) => {
			toastError(m.toast_plugins_reload_error(), error, m.toast_plugins_unexpected_error());
		},
	});

	const invalidatePluginQueries = () =>
		Promise.all([
			queryClient.invalidateQueries({ queryKey: adminKeys.plugins() }),
			queryClient.invalidateQueries({ queryKey: pluginKeys.all }),
		]);

	const enablePluginMutation = useMutation({
		mutationFn: async (pluginId: string) => {
			return await reelvault.admin.enablePlugin(pluginId);
		},
		onSuccess: async () => {
			await invalidatePluginQueries();
			toast.success(m.toast_plugin_enabled());
		},
		onError: (error) => {
			toastError(m.toast_plugin_enable_failed(), error, m.toast_plugins_unexpected_error());
		},
	});

	const disablePluginMutation = useMutation({
		mutationFn: async (pluginId: string) => {
			return await reelvault.admin.disablePlugin(pluginId);
		},
		onSuccess: async () => {
			await invalidatePluginQueries();
			toast.success(m.toast_plugin_disabled());
		},
		onError: (error) => {
			toastError(m.toast_plugin_disable_failed(), error, m.toast_plugins_unexpected_error());
		},
	});

	const reloadPluginMutation = useMutation({
		mutationFn: async (pluginId: string) => {
			return await reelvault.admin.reloadPlugin(pluginId);
		},
		onSuccess: async () => {
			await invalidatePluginQueries();
			toast.success(m.toast_plugin_reloaded());
		},
		onError: (error) => {
			toastError(m.toast_plugin_reload_failed(), error, m.toast_plugins_unexpected_error());
		},
	});

	return {
		pluginsQuery,
		plugins: pluginsQuery.data ?? [],
		reloadAll: reloadAllMutation.mutateAsync,
		enablePlugin: enablePluginMutation.mutateAsync,
		disablePlugin: disablePluginMutation.mutateAsync,
		reloadPlugin: reloadPluginMutation.mutateAsync,
		isReloadingAll: reloadAllMutation.isPending,
		isEnabling: enablePluginMutation.isPending,
		isDisabling: disablePluginMutation.isPending,
		isReloading: reloadPluginMutation.isPending,
	};
}
