import { useEffect } from "react";

/**
 * Sets the browser-tab title for the mounted page. The base name is appended
 * automatically; pass `undefined` to fall back to the bare app name.
 */
export function usePageTitle(title: string | undefined) {
	useEffect(() => {
		document.title = title ? `${title} · ReelVault` : "ReelVault";
	}, [title]);
}
