import { useParams } from "@tanstack/react-router";
import { useEffect } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";
import { setSleepTimer } from "./utils/player-sleep-timer";

const PlayerPage = lazyRouteComponent(() => import("./player-page"));

export function PlayerLayout() {
	const { id } = useParams({ from: "/player/$id" });

	// Runs once per viewing session: PlayerPage remounts on every episode change
	// (key={id}), so a sleep timer reset there would not survive auto-advance.
	useEffect(() => {
		return () => {
			setSleepTimer({ kind: "off" });
			if (document.fullscreenElement) {
				detach(() => document.exitFullscreen());
			}
		};
	}, []);

	return (
		<RequireAuth requireProfile>
			{/* view-transition-name excludes the player content from the default
			    document cross-fade (globals.css) — entry should be instant. */}
			<div className="[view-transition-name:player]">
				<PlayerPage key={id} />
			</div>
		</RequireAuth>
	);
}
