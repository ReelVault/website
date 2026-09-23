import { cn } from "cn";
import { FastForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";
import { usePlayerInfo, usePlayerMarkers, usePlayerNextEpisode, usePlayerStatus, usePlayerTime } from "../player-context";

export function PlayerMarkerButton() {
	const { activeMarker, skipActiveMarker } = usePlayerMarkers();
	const { nextEpisode, isNextEpisodeDismissed } = usePlayerNextEpisode();
	const { currentTime } = usePlayerTime();
	const { canPlay, playerError } = usePlayerStatus();
	const info = usePlayerInfo();

	if (!activeMarker || activeMarker.type === "highlight" || activeMarker.startSeconds === activeMarker.endSeconds) return null;

	const remainingTime = info.duration ? info.duration - currentTime : Number.POSITIVE_INFINITY;
	const isNextEpisodeOverlayShowing =
		Boolean(nextEpisode) &&
		canPlay &&
		!playerError &&
		!isNextEpisodeDismissed &&
		(remainingTime <= 30 || currentTime >= info.duration) &&
		currentTime > 10;

	let label: string;
	if (activeMarker.type === "intro") label = m.player_skip_intro();
	else if (activeMarker.type === "credits") label = m.player_skip_credits();
	else if (activeMarker.type === "recap") label = m.player_skip_summary();
	else if (activeMarker.label) label = m.player_pomin_label({ label: activeMarker.label });
	else label = m.player_skip();

	return (
		<div
			className={cn(
				"fade-in slide-in-from-bottom-2 absolute right-3 z-30 animate-in transition-[opacity] duration-200 sm:right-8",
				isNextEpisodeOverlayShowing ? "bottom-64" : "bottom-28 sm:bottom-24",
			)}
		>
			<Button
				variant="outline"
				onClick={skipActiveMarker}
				className="h-11 gap-2 rounded-full border-border/80 bg-background/80 px-5 font-semibold text-foreground text-sm transition-[border-color,background-color,color,box-shadow] hover:scale-105 hover:border-primary/50 hover:bg-background active:scale-95"
			>
				<FastForward className="size-4 text-primary" aria-hidden="true" />
				<span>{label}</span>
			</Button>
		</div>
	);
}
