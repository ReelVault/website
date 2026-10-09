import type { PluginAdminStatus } from "@reelvault/sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "../../utils/toast-utils";
import { reelvault } from "../client";
import { adminKeys, pluginKeys } from "../utils/query-keys";

export function useAdminPlugins() {
	const queryClient = useQueryClient();

	const pluginsQuery = useQuery<PluginAdminStatus[]>({
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

	const setPluginsEnabledMutation = useMutation({
		mutationFn: async ({ pluginIds, enabled }: { pluginIds: string[]; enabled: boolean }) => {
			return await reelvault.admin.setPluginsEnabled({ enabled, pluginIds });
		},
		onSuccess: async (result) => {
			await invalidatePluginQueries();
			const failed = result.results.filter((entry) => !entry.ok).length;
			if (failed === 0) toast.success(m.admin_plugins_bulk_done({ count: result.results.length }));
			else toast.error(m.admin_plugins_bulk_partial({ failed, total: result.results.length }));
		},
		onError: (error) => {
			toastError(m.admin_plugins_bulk_failed(), error, m.toast_plugins_unexpected_error());
		},
	});

	const setPluginPinnedMutation = useMutation({
		mutationFn: async ({ pluginId, pinned }: { pluginId: string; pinned: boolean }) => {
			return await reelvault.admin.setPluginPinned(pluginId, pinned);
		},
		onSuccess: async () => {
			await invalidatePluginQueries();
			toast.success(m.admin_plugins_pin_saved());
		},
		onError: (error) => {
			toastError(m.admin_plugins_pin_failed(), error, m.toast_plugins_unexpected_error());
		},
	});

	const setPluginCspMutation = useMutation({
		mutationFn: async ({ pluginId, enabled }: { pluginId: string; enabled: boolean }) => {
			return await reelvault.admin.setPluginCsp(pluginId, enabled);
		},
		onSuccess: async () => {
			await invalidatePluginQueries();
			toast.success(m.admin_plugins_csp_saved());
		},
		onError: (error) => {
			toastError(m.admin_plugins_csp_failed(), error, m.toast_plugins_unexpected_error());
		},
	});

	return {
		pluginsQuery,
		plugins: pluginsQuery.data ?? [],
		reloadAll: reloadAllMutation.mutateAsync,
		enablePlugin: enablePluginMutation.mutateAsync,
		disablePlugin: disablePluginMutation.mutateAsync,
		reloadPlugin: reloadPluginMutation.mutateAsync,
		setPluginCsp: setPluginCspMutation.mutateAsync,
		setPluginsEnabled: setPluginsEnabledMutation.mutateAsync,
		isBulkUpdating: setPluginsEnabledMutation.isPending,
		setPluginPinned: setPluginPinnedMutation.mutateAsync,
		isSettingCsp: setPluginCspMutation.isPending,
		isReloadingAll: reloadAllMutation.isPending,
		isEnabling: enablePluginMutation.isPending,
		isDisabling: disablePluginMutation.isPending,
		isReloading: reloadPluginMutation.isPending,
	};
}
