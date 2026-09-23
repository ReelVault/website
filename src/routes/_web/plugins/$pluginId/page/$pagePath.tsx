import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const PluginPage = lazyRouteComponent(() => import("@/components/plugin-iframe-page"));

/** Plugin pages carry arbitrary string params through the URL query string. */
function pluginPageSearch(search: Record<string, unknown>): Record<string, string> {
	const result: Record<string, string> = {};
	for (const [key, value] of Object.entries(search)) {
		if (typeof value === "string") result[key] = value;
	}

	return result;
}

export const Route = createFileRoute("/_web/plugins/$pluginId/page/$pagePath")({
	validateSearch: pluginPageSearch,
	component: PluginPage,
});
