import { createContext, type ReactNode, useContext, useSyncExternalStore } from "react";

export const PortalContainerContext = createContext<HTMLElement | null>(null);

export function PortalContainerProvider({ container, children }: { container: HTMLElement | null; children: ReactNode }) {
	return <PortalContainerContext.Provider value={container}>{children}</PortalContainerContext.Provider>;
}

function subscribeFullscreen(callback: () => void) {
	if (typeof document === "undefined") {
		return () => {
			// No-op: no document in non-browser runtimes, nothing to clean up.
		};
	}

	document.addEventListener("fullscreenchange", callback);

	return () => document.removeEventListener("fullscreenchange", callback);
}

function getFullscreenSnapshot(): HTMLElement | null {
	const element = typeof document !== "undefined" ? document.fullscreenElement : null;

	return element instanceof HTMLElement ? element : null;
}

function getFullscreenServerSnapshot(): HTMLElement | null {
	return null;
}

/**
 * Returns the effective container for Base UI portals:
 * 1. An explicitly passed container (if defined).
 * 2. The container from PortalContainerContext (e.g. video player container).
 * 3. The current document.fullscreenElement (if active).
 * 4. undefined (Base UI defaults to document.body).
 */
export function usePortalContainer(
	explicitContainer?: HTMLElement | ShadowRoot | React.RefObject<HTMLElement | ShadowRoot | null> | null,
): HTMLElement | ShadowRoot | React.RefObject<HTMLElement | ShadowRoot | null> | null | undefined {
	const contextContainer = useContext(PortalContainerContext);
	const fullscreenEl = useSyncExternalStore(subscribeFullscreen, getFullscreenSnapshot, getFullscreenServerSnapshot);

	if (explicitContainer !== undefined) {
		return explicitContainer;
	}

	if (contextContainer) {
		return contextContainer;
	}

	return fullscreenEl ?? undefined;
}
