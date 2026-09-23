import { useParams, useSearch } from "@tanstack/react-router";
import { PluginPageHost } from "@/plugin-host/page-host";

function safeDecode(value: string): string {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}

export default function PluginPage() {
	const { pluginId, pagePath } = useParams({ from: "/_web/plugins/$pluginId/page/$pagePath" });
	const params = useSearch({ from: "/_web/plugins/$pluginId/page/$pagePath" });

	return <PluginPageHost pluginId={safeDecode(pluginId)} pagePath={safeDecode(pagePath)} params={params} />;
}
