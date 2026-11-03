import { useEffect } from "react";
import { noopCleanup } from "@/lib/detach";
import { isTvDevice } from "@/utils/tv-device";
import { initSpatialNavigation } from "./spatial-navigation";

/**
 * Mounts the D-pad/arrow spatial navigation for the lifetime of the layout.
 * Player layouts deliberately don't call this — the player owns its own
 * arrow-key shortcuts (seek/volume).
 *
 * Arrow keys must keep scrolling on desktop; only TV remotes/D-pads opt in.
 */
export function useSpatialNavigation(): void {
	useEffect(() => {
		if (!isTvDevice()) return noopCleanup;

		return initSpatialNavigation();
	}, []);
}
