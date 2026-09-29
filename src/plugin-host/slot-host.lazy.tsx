import type { PluginSlotName, PluginUiPlayerContext } from "@reelvault/sdk/plugin";
import { lazy, Suspense } from "react";

/**
 * Lazy facade over the slot host: the real renderer pulls dropdown-menu and
 * sidebar primitives (the whole @base-ui core), which must stay out of the
 * eager shell. Slots render nothing without plugin contributions, so a null
 * fallback is indistinguishable from the empty state.
 */
async function loadSlotHost() {
	const module = await import("./slot-host");

	return { default: module.PluginSlotHost };
}

const LazyPluginSlotHost = lazy(() => loadSlotHost());

export function PluginSlotHost(props: {
	name: PluginSlotName;
	variant?: Parameters<typeof LazyPluginSlotHost>[0]["variant"];
	buttonClassName?: string;
	playerContext?: PluginUiPlayerContext;
	params?: Record<string, string>;
	excludePaths?: string[];
}) {
	return (
		<Suspense fallback={null}>
			<LazyPluginSlotHost {...props} />
		</Suspense>
	);
}
