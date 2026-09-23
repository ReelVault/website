import { Loader2 } from "lucide-react";
import { usePluginUiManifest } from "@/client/hooks/use-plugin-ui";
import { usePlugins } from "@/client/hooks/use-plugins";
import { m } from "@/paraglide/messages";
import { PluginSurface } from "./surface";

interface PluginPageHostProps {
	pluginId: string;
	/** URL path segment declared in the manifest. */
	pagePath: string;
	params?: Record<string, string> | undefined;
}

/** Clears the fixed app navbar; the surface supplies its own content rhythm. */
const SHELL_CLASS = "min-h-screen bg-background pt-16 pb-16 lg:pt-20";

/** Generic full-page renderer driven entirely by a plugin's ui.json `pages`. */
export function PluginPageHost({ pluginId, pagePath, params }: PluginPageHostProps) {
	const { isPluginActive, isLoading: pluginsLoading } = usePlugins();
	const { data: manifest, isLoading: manifestLoading } = usePluginUiManifest();

	if (pluginsLoading || manifestLoading) {
		return (
			<div className={SHELL_CLASS}>
				<div className="flex min-h-[50vh] items-center justify-center">
					<Loader2 className="size-6 animate-spin text-muted-foreground" />
				</div>
			</div>
		);
	}

	const page = manifest?.plugins[pluginId]?.pages?.find((candidate) => candidate.path === pagePath);
	if (!(isPluginActive(pluginId) && page)) {
		return (
			<div className={SHELL_CLASS}>
				<div className="flex min-h-[50vh] items-center justify-center">
					<p className="text-muted-foreground">{m.components_plugin_unavailable()}</p>
				</div>
			</div>
		);
	}

	return (
		<div className={SHELL_CLASS}>
			<PluginSurface
				key={`${pluginId}:${page.id}`}
				pluginId={pluginId}
				tag={page.tag}
				schema={page.schema}
				page={page.id}
				params={params}
				className="w-full"
			/>
		</div>
	);
}
