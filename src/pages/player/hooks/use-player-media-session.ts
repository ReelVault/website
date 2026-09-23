import { useEffect, useRef } from "react";
import type { CurrentEpisodeInfo, NextEpisodeInfo } from "../utils/player.types";
import { detach, noopCleanup } from "../utils/player-utils";

interface UsePlayerMediaSessionProps {
	videoRef: React.RefObject<HTMLVideoElement | null>;
	title: string;
	currentEpisode: CurrentEpisodeInfo | null;
	nextEpisode: NextEpisodeInfo | null;
	duration: number;
	currentTime: number;
	playbackRate: number;
	isPaused: boolean;
	seek: (position: number) => Promise<void>;
	getAbsoluteTime: (videoCurrentTime: number) => number;
	playNextEpisode: () => void;
}

export function usePlayerMediaSession({
	videoRef,
	title,
	currentEpisode,
	nextEpisode,
	duration,
	currentTime,
	playbackRate,
	isPaused,
	seek,
	getAbsoluteTime,
	playNextEpisode,
}: UsePlayerMediaSessionProps) {
	const callbacksRef = useRef({
		videoRef,
		seek,
		getAbsoluteTime,
		playNextEpisode,
		nextEpisode,
	});

	useEffect(() => {
		callbacksRef.current = {
			videoRef,
			seek,
			getAbsoluteTime,
			playNextEpisode,
			nextEpisode,
		};
	});

	// 1. Metadata setup
	useEffect(() => {
		if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

		const epTitle = currentEpisode?.title;
		const seasonEp = currentEpisode ? `S${currentEpisode.seasonNumber}:E${currentEpisode.episodeNumber}` : undefined;

		const displayTitle = epTitle ? `${seasonEp ? `${seasonEp} - ` : ""}${epTitle}` : title;
		const displayArtist = epTitle ? title : "ReelVault";

		try {
			navigator.mediaSession.metadata = new MediaMetadata({
				title: displayTitle,
				artist: displayArtist,
				album: seasonEp ?? "ReelVault",
			});
		} catch (error) {
			console.warn("Failed to set MediaSession metadata:", error);
		}
	}, [title, currentEpisode]);

	// 2. Playback state setup
	useEffect(() => {
		if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

		try {
			navigator.mediaSession.playbackState = isPaused ? "paused" : "playing";
		} catch {
			// ignore
		}
	}, [isPaused]);

	// 3. Position state setup
	useEffect(() => {
		if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

		if (typeof navigator.mediaSession.setPositionState !== "function") return;

		if (duration > 0 && Number.isFinite(duration) && Number.isFinite(currentTime)) {
			try {
				navigator.mediaSession.setPositionState({
					duration: Math.max(0, duration),
					playbackRate: Math.max(0.1, playbackRate),
					position: Math.max(0, Math.min(currentTime, duration)),
				});
			} catch {
				// Out of range or invalid state
			}
		}
	}, [duration, currentTime, playbackRate]);

	// 4. Action handlers setup
	useEffect(() => {
		if (typeof window === "undefined" || !("mediaSession" in navigator)) return noopCleanup;

		const setActionHandler = (action: MediaSessionAction, handler: MediaSessionActionHandler | null) => {
			try {
				navigator.mediaSession.setActionHandler(action, handler);
			} catch {
				// Action might not be supported on this browser
			}
		};

		setActionHandler("play", () => {
			const video = callbacksRef.current.videoRef.current;
			if (!video) return;

			detach(() => video.play());
		});

		setActionHandler("pause", () => {
			callbacksRef.current.videoRef.current?.pause();
		});

		setActionHandler("seekbackward", (details) => {
			const delta = details.seekOffset ?? 10;
			const video = callbacksRef.current.videoRef.current;
			if (!video) return;

			const current = callbacksRef.current.getAbsoluteTime(video.currentTime);
			detach(() => callbacksRef.current.seek(Math.max(0, current - delta)));
		});

		setActionHandler("seekforward", (details) => {
			const delta = details.seekOffset ?? 10;
			const video = callbacksRef.current.videoRef.current;
			if (!video) return;

			const current = callbacksRef.current.getAbsoluteTime(video.currentTime);
			detach(() => callbacksRef.current.seek(current + delta));
		});

		setActionHandler("seekto", (details) => {
			if (details.seekTime !== undefined && Number.isFinite(details.seekTime)) {
				const target = details.seekTime;
				detach(() => callbacksRef.current.seek(target));
			}
		});

		setActionHandler("nexttrack", () => {
			if (callbacksRef.current.nextEpisode) {
				callbacksRef.current.playNextEpisode();
			}
		});

		setActionHandler("previoustrack", () => {
			detach(() => callbacksRef.current.seek(0));
		});

		return () => {
			const actions: MediaSessionAction[] = ["play", "pause", "seekbackward", "seekforward", "seekto", "nexttrack", "previoustrack"];
			for (const act of actions) {
				setActionHandler(act, null);
			}

			if (typeof window !== "undefined" && "mediaSession" in navigator) {
				try {
					navigator.mediaSession.metadata = null;
					navigator.mediaSession.playbackState = "none";
				} catch {
					// ignore
				}
			}
		};
	}, []);
}
