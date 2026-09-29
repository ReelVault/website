import { lazy, type ReactNode, Suspense, useState } from "react";
import { PluginDialogContext, type PluginDialogRequest } from "./plugin-dialog-context";

// The dialog chrome lives in its own chunk: base-ui dialog must not ride in
// the eager shell for a surface most sessions never open.
async function loadPluginDialogHost() {
	const module = await import("./plugin-dialog-host");

	return { default: module.PluginDialogHost };
}

const LazyPluginDialogHost = lazy(() => loadPluginDialogHost());

/**
 * Global controller for plugin dialogs. Any surface (slot, page, iframe bridge)
 * can request a dialog by id; the host resolves it from the manifest and owns
 * the overlay lifecycle.
 */
export function PluginDialogProvider({ children }: { children: ReactNode }) {
	const [request, setRequest] = useState<PluginDialogRequest | null>(null);

	return (
		// React Compiler memoizes this value; the explicit useMemo rule does not apply.
		// oxlint-disable-next-line react/jsx-no-constructed-context-values
		<PluginDialogContext.Provider value={{ openDialog: setRequest, closeDialog: () => setRequest(null) }}>
			{children}
			{request ? (
				<Suspense fallback={null}>
					<LazyPluginDialogHost request={request} onClose={() => setRequest(null)} />
				</Suspense>
			) : null}
		</PluginDialogContext.Provider>
	);
}
