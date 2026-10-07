import { useSyncExternalStore } from "react";
import { noopCleanup } from "@/lib/detach";

/**
 * Subscribes to a CSS media query. Used to decide whether an always-visible
 * desktop surface must mount eagerly, or whether a heavy interaction-only
 * component can stay unmounted (and out of the eager bundle) on small screens.
 */
export function useMediaQuery(query: string): boolean {
	const subscribe = (onChange: () => void) => {
		if (typeof window === "undefined") return noopCleanup;

		const list = window.matchMedia(query);
		list.addEventListener("change", onChange);

		return () => list.removeEventListener("change", onChange);
	};

	return useSyncExternalStore(
		subscribe,
		() => (typeof window === "undefined" ? false : window.matchMedia(query).matches),
		() => false,
	);
}
