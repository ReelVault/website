import { Play, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";
import { usePlayerInfo, usePlayerNextEpisode, usePlayerStatus, usePlayerTime } from "../player-context";

export function PlayerNextEpisodeOverlay() {
	const { nextEpisode, playNextEpisode, isNextEpisodeDismissed, setIsNextEpisodeDismissed, autoplay } = usePlayerNextEpisode();
	const { currentTime } = usePlayerTime();
	const info = usePlayerInfo();
	const { canPlay, playerError } = usePlayerStatus();
	const autoPlayTriggeredRef = useRef(false);

	// Reset dismissed state whenever the media file or next episode changes
	const lastResetKeyRef = useRef<string | null>(null);
	useEffect(() => {
		const key = `${info.mediaFileId}:${nextEpisode?.mediaFileId ?? ""}`;
		if (lastResetKeyRef.current === key) return;

		lastResetKeyRef.current = key;
		setIsNextEpisodeDismissed(false);
		autoPlayTriggeredRef.current = false;
	}, [info.mediaFileId, nextEpisode?.mediaFileId, setIsNextEpisodeDismissed]);

	const isAutoplay = autoplay;
	const duration = info.duration;
	const remainingTime = duration > 0 ? duration - currentTime : Number.POSITIVE_INFINITY;
	// Automatically show when remaining time is 30 seconds or less (or playback ended), provided duration is valid and past initial 10s
	const shouldShow = duration > 0 && (remainingTime <= 30 || currentTime >= duration) && currentTime > 10;

	// Auto-advance when countdown reaches 0 and autoplay is on
	useEffect(() => {
		if (!(shouldShow && isAutoplay) || isNextEpisodeDismissed || autoPlayTriggeredRef.current) return;

		if (typeof window !== "undefined" && !window.location.pathname.startsWith("/player")) return;

		if (remainingTime <= 0 || currentTime >= duration) {
			autoPlayTriggeredRef.current = true;
			playNextEpisode();
		}
	}, [shouldShow, isAutoplay, isNextEpisodeDismissed, remainingTime, currentTime, duration, playNextEpisode]);

	if (!(nextEpisode && canPlay) || playerError || isNextEpisodeDismissed || !shouldShow) return null;

	const seasonEpLabel = `S${nextEpisode.seasonNumber}:E${nextEpisode.episodeNumber}`;
	const episodeTitle = nextEpisode.title
		? `${seasonEpLabel} - ${nextEpisode.title}`
		: m.player_episode_number_word({ number: nextEpisode.episodeNumber });

	return (
		<div
			role="status"
			aria-live="polite"
			className="fade-in slide-in-from-bottom-4 pointer-events-auto absolute right-3 bottom-28 z-30 max-w-sm animate-in duration-300 sm:right-8 sm:bottom-24"
		>
			<div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-background/90 p-4 shadow-2xl">
				<div className="flex items-center justify-between gap-2">
					<span className="font-black text-[10px] text-primary uppercase tracking-wider">{m.player_next_episode()}</span>
					<button
						type="button"
						onClick={() => setIsNextEpisodeDismissed(true)}
						className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
						aria-label={m.player_close_notification()}
					>
						<X className="size-4" />
					</button>
				</div>

				<div className="flex flex-col gap-0.5">
					<p className="line-clamp-1 font-semibold text-foreground text-sm">{episodeTitle}</p>
					{isAutoplay && remainingTime > 0 && remainingTime <= 30 && (
						<p className="text-muted-foreground text-xs">{m.player_autoplay_countdown({ seconds: Math.ceil(remainingTime) })}</p>
					)}
				</div>

				<Button type="button" onClick={playNextEpisode} size="lg" className="w-full gap-2 rounded-xl">
					<Play className="size-3.5 fill-current" />
					{m.player_play_next()}
				</Button>
			</div>
		</div>
	);
}
