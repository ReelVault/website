import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;

// Lazily created: a module-scope `window.matchMedia` breaks any non-browser
// import (SSR/test). Cached so identity is stable across subscribe/getSnapshot.
let mql: MediaQueryList | null = null;

function getMediaQueryList(): MediaQueryList | null {
	if (mql) return mql;

	if (typeof window === "undefined") return null;

	mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

	return mql;
}

function subscribe(onChange: () => void) {
	const query = getMediaQueryList();
	if (!query)
		return () => {
			/* no-op */
		};

	query.addEventListener("change", onChange);

	return () => query.removeEventListener("change", onChange);
}

export function useIsMobile() {
	return useSyncExternalStore(
		subscribe,
		() => getMediaQueryList()?.matches ?? false,
		() => false,
	);
}
