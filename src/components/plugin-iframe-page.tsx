import { useParams, useSearch } from "@tanstack/react-router";
import { PluginPageHost } from "@/plugin-host/page-host";

export default function PluginPage() {
	const { pluginId, pagePath } = useParams({ from: "/_web/plugins/$pluginId/page/$pagePath" });
	const params = useSearch({ from: "/_web/plugins/$pluginId/page/$pagePath" });

	return <PluginPageHost pluginId={pluginId} pagePath={pagePath} params={params} />;
}
