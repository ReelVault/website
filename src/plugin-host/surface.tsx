import type { PluginUiPlayerContext, PluginUiSchemaSurface } from "@reelvault/sdk/plugin";
import { getPluginUiFileUrl, usePluginUiManifest } from "@/client/hooks/use-plugin-ui";
import { m } from "@/paraglide/messages";
import { PluginCustomElement } from "./custom-element";
import { PluginSchemaSurface } from "./schema/renderer";
import { PluginSlotBoundary } from "./slot-error-boundary";
import { usePluginUiContext } from "./ui-context";

interface PluginSurfaceProps {
	pluginId: string;
	/** Custom element tag (escape hatch). */
	tag?: string | undefined;
	/** Declarative schema rendered with the host's components. */
	schema?: PluginUiSchemaSurface | undefined;
	page?: string | undefined;
	dialog?: string | undefined;
	params?: Record<string, string> | undefined;
	player?: PluginUiPlayerContext | undefined;
	onClose?: (() => void) | undefined;
	className?: string;
}

/** Renders a plugin surface: declarative schema or custom element. */
export function PluginSurface({ pluginId, tag, schema, page, dialog, params, player, onClose, className }: PluginSurfaceProps) {
	const { data: manifest } = usePluginUiManifest();
	const context = usePluginUiContext({ pluginId, page, dialog, params, player });
	const pluginManifest = manifest?.plugins[pluginId];

	if (schema) {
		return (
			// Schema surfaces render in the host React tree (custom elements already
			// isolate their own errors) — a throw here must not blank the whole page.
			<PluginSlotBoundary pluginId={pluginId}>
				<PluginSchemaSurface
					pluginId={pluginId}
					schema={schema}
					context={{ ...context, ...(pluginManifest?.defaultLocale ? { defaultLocale: pluginManifest.defaultLocale } : {}) }}
					onClose={onClose}
					className={className}
				/>
			</PluginSlotBoundary>
		);
	}

	const entry = pluginManifest?.entry;
	if (!(tag && entry)) return <p className={className}>{m.components_plugin_unavailable()}</p>;

	// Version the module URL so a rebuilt plugin is fetched immediately instead of
	// being served from the browser's module/HTTP cache under the same path.
	const moduleUrl = `${getPluginUiFileUrl(pluginId, entry)}?v=${encodeURIComponent(pluginManifest.version)}`;

	return (
		<PluginCustomElement pluginId={pluginId} tag={tag} moduleUrl={moduleUrl} context={context} onClose={onClose} className={className} />
	);
}
