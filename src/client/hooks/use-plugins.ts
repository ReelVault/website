import type { PluginRuntimeStatus } from "@reelvault/sdk";
import { useQuery } from "@tanstack/react-query";
import { reelvault } from "../client";
import { pluginKeys } from "../utils/query-keys";

export function usePlugins() {
	const query = useQuery<PluginRuntimeStatus[]>({
		queryKey: pluginKeys.list(),
		queryFn: async () => {
			return await reelvault.plugins.list();
		},
		staleTime: 60_000,
		refetchOnWindowFocus: false,
	});

	const plugins = query.data ?? [];

	const isPluginActive = (pluginId: string): boolean => {
		return plugins.some((p) => p.id === pluginId && p.state === "enabled");
	};

	const getPlugin = (pluginId: string): PluginRuntimeStatus | undefined => {
		return plugins.find((p) => p.id === pluginId);
	};

	return {
		...query,
		plugins,
		isPluginActive,
		getPlugin,
	};
}
