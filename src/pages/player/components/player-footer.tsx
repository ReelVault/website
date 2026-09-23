import { cn } from "cn";
import {
	FastForward,
	Maximize,
	Minimize,
	Pause,
	PictureInPicture2,
	Play,
	Rewind,
	SkipForward,
	Volume1,
	Volume2,
	VolumeX,
} from "lucide-react";
import { type ReactNode, useSyncExternalStore } from "react";
import { m } from "@/paraglide/messages";
import { usePlayerActions, usePlayerNextEpisode, usePlayerStatus, usePlayerVolume } from "../player-context";
import { MAX_PLAYER_VOLUME } from "../utils/player-audio-boost";
import { detach, toggleFullscreen, togglePiP, togglePlayPause } from "../utils/player-utils";
import { PlayerControlButton } from "./player-control-button";
import { PlayerProgressBar } from "./player-progress-bar";

export function PlayerFooter({ children }: { children: ReactNode }) {
	const { nextEpisode, playNextEpisode } = usePlayerNextEpisode();
	const actions = usePlayerActions();
	const { isPaused } = usePlayerStatus();
	const { volume, isMuted } = usePlayerVolume();

	const isFullscreen = useSyncExternalStore(
		(notify) => {
			document.addEventListener("fullscreenchange", notify);

			return () => document.removeEventListener("fullscreenchange", notify);
		},
		() => Boolean(document.fullscreenElement),
		() => false,
	);

	// -------------------------------------------------------------------------
	// Derived icon for volume button
	// -------------------------------------------------------------------------

	const isBoosted = volume > 1 && !isMuted;
	let VolumeIcon = Volume2;
	if (isMuted || volume === 0) VolumeIcon = VolumeX;
	else if (volume < 0.5) VolumeIcon = Volume1;

	let volumeDescription: string;
	if (isMuted) volumeDescription = m.player_unmute();
	else if (isBoosted) volumeDescription = m.player_mute_boosted({ percent: Math.round(volume * 100) });
	else volumeDescription = m.player_mute();

	// -------------------------------------------------------------------------
	// Toggle fullscreen via the container (parent of this component)
	// -------------------------------------------------------------------------

	const handleFullscreen = () => {
		const container = actions.videoRef.current?.closest<HTMLElement>(".group\\/player");
		if (container) toggleFullscreen(container, actions.videoRef.current);
	};

	// -------------------------------------------------------------------------
	// PiP
	// -------------------------------------------------------------------------

	const handlePip = () => {
		const video = actions.videoRef.current;
		if (video) togglePiP(video);
	};

	// -------------------------------------------------------------------------
	// Play / Pause
	// -------------------------------------------------------------------------

	const handlePlay = () => {
		const video = actions.videoRef.current;
		if (video) togglePlayPause(video);
	};

	// -------------------------------------------------------------------------
	// Seek ±10s
	// -------------------------------------------------------------------------

	const seekRelative = (delta: number) => {
		const video = actions.videoRef.current;
		if (!video) return;

		detach(() => actions.seek(actions.getAbsoluteTime(video.currentTime) + delta));
	};

	return (
		<div className="flex w-full flex-col gap-1">
			<PlayerProgressBar />

			<div className="flex w-full flex-wrap items-center justify-between gap-y-2">
				<div className="flex items-center gap-2 sm:gap-3">
					{/* Play / Pause */}
					<PlayerControlButton
						description={isPaused ? m.player_play_action() : m.player_pause_action()}
						variant="primary"
						render={<button type="button" onClick={handlePlay} aria-label={isPaused ? m.player_play_action() : m.player_pause_action()} />}
					>
						{isPaused ? <Play className="ml-0.5 size-5 fill-current" /> : <Pause className="size-5 fill-current" />}
					</PlayerControlButton>

					{/* Seek -10s */}
					<PlayerControlButton
						description="-10s"
						render={<button type="button" onClick={() => seekRelative(-10)} aria-label={m.player_seek_back_10s()} />}
					>
						<Rewind className="size-5" />
					</PlayerControlButton>

					{/* Seek +10s */}
					<PlayerControlButton
						description="+10s"
						render={<button type="button" onClick={() => seekRelative(10)} aria-label={m.player_shift_subtitles_10s()} />}
					>
						<FastForward className="size-5" />
					</PlayerControlButton>

					{/* Next episode */}
					{nextEpisode && (
						<PlayerControlButton
							description={m.player_next_episode_with_title({
								seasonNumber: nextEpisode.seasonNumber,
								episodeNumber: nextEpisode.episodeNumber,
								titleSuffix: nextEpisode.title ? ` - ${nextEpisode.title}` : "",
							})}
							className="hidden sm:flex"
							render={<button type="button" onClick={playNextEpisode} aria-label={m.player_next_episode()} />}
						>
							<SkipForward className="size-5" />
						</PlayerControlButton>
					)}

					{/* Volume group — a volume slider only makes sense with a cursor; on touch the system button remains */}
					<div
						className="group/volume hidden items-center gap-3 sm:flex"
						onWheel={(e) => {
							e.preventDefault();
							const delta = e.deltaY < 0 ? 0.05 : -0.05;
							let next = Math.max(0, Math.min(MAX_PLAYER_VOLUME, Math.round((volume + delta) * 100) / 100));
							if (Math.abs(next - 1) < 0.02) next = 1;

							if (next === 0) {
								actions.setMuted(true);
							} else {
								if (isMuted) actions.setMuted(false);

								actions.setVolume(next);
							}
						}}
					>
						<PlayerControlButton
							description={volumeDescription}
							render={<button type="button" onClick={() => actions.setMuted(!isMuted)} aria-label={volumeDescription} />}
						>
							<VolumeIcon className={cn("size-5", isBoosted && "text-warning")} />
						</PlayerControlButton>

						{/* Volume slider */}
						<div className="relative flex h-6 w-0 cursor-pointer items-center overflow-hidden transition-[width] duration-300 group-hover/volume:w-28">
							<div className="relative h-1.25 w-full overflow-hidden rounded-sm bg-foreground/30">
								{/* 100% indicator notch */}
								<div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-0.5 -translate-x-1/2 bg-foreground/40" />
								{/* Filled track */}
								<div
									className={cn("h-full rounded-sm transition-[width] duration-75", isBoosted ? "bg-warning" : "bg-primary")}
									style={{ width: `${((isMuted ? 0 : volume) / MAX_PLAYER_VOLUME) * 100}%` }}
								/>
							</div>
							<input
								type="range"
								min={0}
								max={MAX_PLAYER_VOLUME}
								step={0.01}
								value={isMuted ? 0 : volume}
								aria-label={m.player_volume_rounded({ volume: Math.round((isMuted ? 0 : volume) * 100) })}
								className="absolute inset-0 size-full cursor-pointer appearance-none bg-transparent opacity-0 [&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:opacity-0 [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:opacity-0"
								onChange={(e) => {
									let val = Number(e.target.value);
									if (Math.abs(val - 1) < 0.04) val = 1;

									actions.setMuted(val === 0);
									actions.setVolume(val);
								}}
							/>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-2 sm:gap-3">
					{children}

					{/* Picture-in-picture — unsupported in mobile browsers */}
					<div className="hidden sm:block">
						<PlayerControlButton
							description={m.player_picture_in_picture()}
							render={<button type="button" onClick={handlePip} aria-label={m.player_pip()} />}
						>
							<PictureInPicture2 className="size-5" />
						</PlayerControlButton>
					</div>

					{/* Fullscreen */}
					<PlayerControlButton
						description={m.admin_logs_fullscreen()}
						render={<button type="button" onClick={handleFullscreen} aria-label={m.admin_logs_fullscreen()} />}
					>
						{isFullscreen ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
					</PlayerControlButton>
				</div>
			</div>
		</div>
	);
}
