import type { PluginUiSettings } from "@reelvault/sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "../../utils/toast-utils";
import { reelvault } from "../client";
import { adminKeys, pluginKeys } from "../utils/query-keys";

/** Interface switches of one plugin: which of its pages, buttons and tabs the app shows. */
export function useAdminPluginUi(pluginId: string) {
	const queryClient = useQueryClient();
	const queryKey = adminKeys.pluginUi(pluginId);

	const query = useQuery({
		queryKey,
		queryFn: () => reelvault.admin.getPluginUiSettings(pluginId),
		staleTime: 60_000,
	});

	// The app builds its navigation from the aggregated manifest, so it must refetch after every change.
	const onSaved = async (settings: PluginUiSettings) => {
		queryClient.setQueryData(queryKey, settings);
		await queryClient.invalidateQueries({ queryKey: pluginKeys.uiManifest() });
		toast.success(m.toast_plugin_ui_saved());
	};

	const updateMutation = useMutation({
		mutationFn: (body: { enabled: boolean; disabledKeys: string[] }) => reelvault.admin.updatePluginUiSettings(pluginId, body),
		onSuccess: onSaved,
		onError: (error) => toastError(m.toast_plugin_ui_save_failed(), error),
	});

	const resetMutation = useMutation({
		mutationFn: () => reelvault.admin.resetPluginUiSettings(pluginId),
		onSuccess: onSaved,
		onError: (error) => toastError(m.toast_plugin_ui_save_failed(), error),
	});

	return {
		settings: query.data,
		isLoading: query.isLoading,
		update: updateMutation.mutateAsync,
		reset: resetMutation.mutateAsync,
		isSaving: updateMutation.isPending || resetMutation.isPending,
	};
}
