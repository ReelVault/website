import { useParams } from "@tanstack/react-router";
import { useEffect } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { lazyRouteComponent } from "@/lib/lazy-route-component";
import { detach } from "./utils/player-utils";

const PlayerPage = lazyRouteComponent(() => import("./player-page"));

export function PlayerLayout() {
	const { id } = useParams({ from: "/player/$id" });

	useEffect(() => {
		return () => {
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
