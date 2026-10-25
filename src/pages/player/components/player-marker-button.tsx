import { cn } from "cn";
import { FastForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";
import { usePlayerInfo, usePlayerMarkers, usePlayerNextEpisode, usePlayerStatus, usePlayerTime } from "../player-context";

export function PlayerMarkerButton() {
	const { activeMarker, skipActiveMarker } = usePlayerMarkers();
	const { nextEpisode, isNextEpisodeDismissed } = usePlayerNextEpisode();
	const { currentTime } = usePlayerTime();
	const { canPlay, isBuffering, playerError } = usePlayerStatus();
	const info = usePlayerInfo();

	if (!activeMarker || activeMarker.type === "highlight" || activeMarker.startSeconds === activeMarker.endSeconds) return null;
	// A skip while the stream is stalled or failed would jump into the same stall, so the button waits for playback.
	if (!canPlay || isBuffering || playerError) return null;

	const remainingTime = info.duration ? info.duration - currentTime : Number.POSITIVE_INFINITY;
	const isNextEpisodeOverlayShowing =
		Boolean(nextEpisode) && !isNextEpisodeDismissed && (remainingTime <= 30 || currentTime >= info.duration) && currentTime > 10;

	let label: string;
	if (activeMarker.type === "intro") label = m.player_skip_intro();
	else if (activeMarker.type === "credits") label = m.player_skip_credits();
	else if (activeMarker.type === "recap") label = m.player_skip_summary();
	else if (activeMarker.label) label = m.player_pomin_label({ label: activeMarker.label });
	else label = m.player_skip();

	return (
		<div
			className={cn(
				"fade-in slide-in-from-bottom-2 animate-in absolute right-3 z-30 transition-[opacity] duration-200 sm:right-8",
				isNextEpisodeOverlayShowing ? "bottom-64" : "bottom-28 sm:bottom-24",
			)}
		>
			<Button shape="pill" variant="outline" onClick={skipActiveMarker} size="lg">
				<FastForward className="text-primary size-4" aria-hidden="true" />
				<span>{label}</span>
			</Button>
		</div>
	);
}
