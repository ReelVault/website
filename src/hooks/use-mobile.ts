import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;
// Tailwind's `lg`: below it the admin sidebar becomes a sheet, so tablets keep the full content width.
const NARROW_LAYOUT_BREAKPOINT = 1024;

// Lazily created: a module-scope `window.matchMedia` breaks any non-browser
// import (SSR/test). Cached per breakpoint so identity is stable across subscribe/getSnapshot.
const mediaQueries = new Map<number, MediaQueryList>();

function getMediaQueryList(breakpoint: number): MediaQueryList | null {
	const cached = mediaQueries.get(breakpoint);
	if (cached) return cached;

	if (typeof window === "undefined") return null;

	const query = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
	mediaQueries.set(breakpoint, query);

	return query;
}

function subscribeTo(breakpoint: number) {
	return (onChange: () => void) => {
		const query = getMediaQueryList(breakpoint);
		if (!query)
			return () => {
				/* no-op */
			};

		query.addEventListener("change", onChange);

		return () => query.removeEventListener("change", onChange);
	};
}

const subscribeMobile = subscribeTo(MOBILE_BREAKPOINT);
const subscribeNarrowLayout = subscribeTo(NARROW_LAYOUT_BREAKPOINT);
const snapshotMobile = () => getMediaQueryList(MOBILE_BREAKPOINT)?.matches ?? false;
const snapshotNarrowLayout = () => getMediaQueryList(NARROW_LAYOUT_BREAKPOINT)?.matches ?? false;
const serverSnapshot = () => false;

export function useIsMobile() {
	return useSyncExternalStore(subscribeMobile, snapshotMobile, serverSnapshot);
}

/** True below 1024 px, where the admin sidebar is a sheet instead of a fixed column. */
export function useIsNarrowLayout() {
	return useSyncExternalStore(subscribeNarrowLayout, snapshotNarrowLayout, serverSnapshot);
}
