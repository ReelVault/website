import type { PluginUiContext } from "@reelvault/sdk/plugin";
import { createElement, useEffect, useState } from "react";
import { detach } from "@/lib/detach";
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

/** Imports the plugin module and checks that it registered the element it declares. */
async function loadPluginElement(moduleUrl: string, tag: string): Promise<void> {
	await import(/* @vite-ignore */ moduleUrl);
	if (!customElements.get(tag)) throw new Error(`Plugin module did not define the "${tag}" custom element`);
}

/**
 * Imports a plugin's ESM module and mounts its custom element inline in the
 * host document. The live host API is assigned as the `reelvaultHost` property;
 * Shadow DOM keeps the plugin's styles isolated while theme tokens inherit.
 */
export function PluginCustomElement({ pluginId, tag, moduleUrl, context, onClose, className }: PluginCustomElementProps) {
	const [state, setState] = useState<"loading" | "ready" | "error">(() =>
		typeof window !== "undefined" && customElements.get(tag) ? "ready" : "loading",
	);
	const [error, setError] = useState<string | null>(null);
	const [element, setElement] = useState<HTMLElement | null>(null);
	const host = usePluginElementHost({ pluginId, context, onClose });

	useEffect(() => {
		let ignore = false;
		const ensureElement = async (): Promise<void> => {
			try {
				await loadPluginElement(moduleUrl, tag);
				if (ignore) return;

				setState("ready");
			} catch (err) {
				if (!ignore) {
					setError(err instanceof Error ? err.message : String(err));
					setState("error");
				}
			}
		};
		detach(ensureElement());

		return () => {
			ignore = true;
		};
	}, [moduleUrl, tag]);

	// Hand the live host API to the element whenever either side is (re)created.
	useEffect(() => {
		if (element) Reflect.set(element, "reelvaultHost", host);
	}, [element, host]);

	if (error) {
		return (
			<div className={className} role="alert">
				{error}
			</div>
		);
	}

	if (state !== "ready") return null;

	return createElement(tag, { className, ref: setElement });
}
