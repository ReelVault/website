import type { PluginUiContext } from "@reelvault/sdk/plugin";
import { createElement, useEffect, useState } from "react";
import { detach } from "@/lib/detach";
import { importWithTimeout } from "@/lib/with-timeout";
import { m } from "@/paraglide/messages";
import { usePluginElementHost } from "./use-plugin-element-host";

interface PluginCustomElementProps {
	pluginId: string;
	/** Custom element tag declared by the plugin surface. */
	tag: string;
	/** ESM module URL that registers the element. */
	moduleUrl: string;
	context: PluginUiContext;
	onClose?: (() => void) | undefined;
	className?: string;
}

// Custom-element tags are global and cannot be redefined in one document. Track
// which module URLs (versioned with `?v=`) were imported so a plugin update is
// detected instead of silently reusing the previous implementation. Keyed by
// module, not tag: one module usually defines several tags, and a tag defined by
// an already imported module is current, not stale.
const importedPluginModules = new Map<string, Promise<void>>();

/** Imports the plugin module once, sharing the import between concurrent mounts. */
function importPluginModule(moduleUrl: string, tag: string): Promise<void> {
	const pending = importedPluginModules.get(moduleUrl);
	if (pending) return pending;

	const load = (async (): Promise<void> => {
		try {
			await importWithTimeout(() => import(/* @vite-ignore */ moduleUrl), `plugin ${tag}`);
		} catch (error) {
			// A failed import may be retried by a later mount.
			importedPluginModules.delete(moduleUrl);
			throw error;
		}
	})();
	importedPluginModules.set(moduleUrl, load);

	return load;
}

/** Imports the plugin module and checks that it registered the element it declares. */
async function loadPluginElement(moduleUrl: string, tag: string): Promise<void> {
	await importPluginModule(moduleUrl, tag);
	if (!customElements.get(tag)) throw new Error(`Plugin module did not define the "${tag}" custom element`);
}

/**
 * Imports a plugin's ESM module and mounts its custom element inline in the
 * host document. The live host API is assigned as the `reelvaultHost` property;
 * Shadow DOM keeps the plugin's styles isolated while theme tokens inherit.
 */
export function PluginCustomElement({ pluginId, tag, moduleUrl, context, onClose, className }: PluginCustomElementProps) {
	const [state, setState] = useState<"loading" | "ready" | "error">(() =>
		typeof window !== "undefined" && customElements.get(tag) && importedPluginModules.has(moduleUrl) ? "ready" : "loading",
	);
	const [error, setError] = useState<string | null>(null);
	const [element, setElement] = useState<HTMLElement | null>(null);
	const host = usePluginElementHost({ pluginId, context, onClose });

	useEffect(() => {
		const controller = new AbortController();
		const ensureElement = async (): Promise<void> => {
			try {
				if (customElements.get(tag) && !importedPluginModules.has(moduleUrl)) {
					// A different module version already owns this tag. Re-registering
					// throws, and reusing it would show stale UI after a plugin update.
					setError(m.components_plugin_reload_required());
					setState("error");

					return;
				}

				await loadPluginElement(moduleUrl, tag);
				if (controller.signal.aborted) return;

				setState("ready");
			} catch (err) {
				if (!controller.signal.aborted) {
					setError(err instanceof Error ? err.message : String(err));
					setState("error");
				}
			}
		};
		detach(ensureElement());

		return () => {
			controller.abort();
		};
	}, [moduleUrl, tag]);

	// Hand the live host API to the element whenever either side is (re)created.
	useEffect(() => {
		if (element) Reflect.set(element, "reelvaultHost", host);
	}, [element, host]);

	if (error) {
		return (
			<div className={className} role="alert">
				<p>{error}</p>
				<button type="button" className="text-primary mt-2 underline" onClick={() => window.location.reload()}>
					{m.common_reload_page()}
				</button>
			</div>
		);
	}

	if (state !== "ready") return null;

	return createElement(tag, { className, ref: setElement });
}
