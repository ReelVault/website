import { useEffect } from "react";
import { initSpatialNavigation } from "./spatial-navigation";

/**
 * Mounts the D-pad/arrow spatial navigation for the lifetime of the layout.
 * Player layouts deliberately don't call this — the player owns its own
 * arrow-key shortcuts (seek/volume).
 */
export function useSpatialNavigation(): void {
	useEffect(() => initSpatialNavigation(), []);
}
