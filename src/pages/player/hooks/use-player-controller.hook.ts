import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "@tanstack/react-router";
import type Hls from "hls.js";
import { type RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MediaMarker, PlaybackCommand, TranscodeProgressResponse } from "reelvault-sdk";
import { reelvault } from "@/client/client";
import { useCollectionDetails } from "@/client/hooks/use-collections";
import { useNextEpisode } from "@/client/hooks/use-episodes";
import { savePlaybackProgress, usePlaybackProgress, usePlaybackSuggestion } from "@/client/hooks/use-me-playback";
import { useMetadataCollection } from "@/client/hooks/use-metadata-queries";
import {
	seekPlaybackSession,
	usePlaybackDiagnostics,
	usePlayerSubtitles,
	useSubtitleContent,
	useSubtitleDownload,
	useSubtitleSearch,
	useTranscodeProgress,
} from "@/client/hooks/use-player-playback";
import { realtimeConnection, useRealtimeEvent } from "@/client/hooks/use-realtime";
import { useSeasons } from "@/client/hooks/use-seasons";
import { mediaKeys, mePlaybackKeys, playbackSessionKeys, profileKeys, watchedHistoryKeys } from "@/client/utils/query-keys";
import { useInterval } from "@/hooks/use-interval";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import type { PlaybackSettings, PlayerMediaFile, PlayerSession, SubtitlePreferences } from "../utils/player.types";
import { toCaptionFormat } from "../utils/player.types";
import {
	applyAudioPipeline,
	disposeAudioBoost,
	getStoredEqualizerConfig,
	isAudioPipelineActive,
	isEqualizerActive,
	MAX_PLAYER_VOLUME,
} from "../utils/player-audio-boost";
import type { PlayerTimeStore } from "../utils/player-time-store";
import { detach, hasBufferAt, isSafeSeek, noopCleanup } from "../utils/player-utils";

const HEARTBEAT_INTERVAL_MS = 10_000;
const DIAGNOSTICS_POLL_INTERVAL_MS = 2500;
// One departure (tab close, navigate away, unmount) can fire visibilitychange,
// pagehide, beforeunload AND the effect cleanup — collapse those saves into one.
const PROGRESS_FLUSH_DEDUPE_MS = 2_000;
const PLAYER_PATH_PREFIX_REGEX = /^\/player\//;

/** Snapshot of browser-reported buffered ranges, in absolute playback time. */
export interface BufferedRange {
	startTime: number;
	endTime: number;
}

// Stable identity for "no transcode data" — a fresh [] per render would churn
// every closure that captures transcodedRanges (seek → actions slice).
const EMPTY_BUFFERED_RANGES: BufferedRange[] = [];

// Same for "no markers" — applyTime/markersValue must not get fresh identities
// on every controller render.
const EMPTY_MEDIA_MARKERS: MediaMarker[] = [];

/** Error fields the player reacts to across client/server failure paths. */
interface PlaybackErrorShape {
	status?: number;
	code?: string;
	message?: string;
}

/** Extracts known error fields without asserting an unknown rejection's shape. */
export function toPlaybackError(value: unknown): PlaybackErrorShape {
	const shape: PlaybackErrorShape = {};
	if (typeof value === "object" && value !== null) {
		if ("status" in value && typeof value.status === "number") shape.status = value.status;

		if ("code" in value && typeof value.code === "string") shape.code = value.code;

		if ("message" in value && typeof value.message === "string") shape.message = value.message;
	}

	return shape;
}

/** The server ends the session on admin stop or expiry — both surface as 403. */
function isForbiddenPlaybackError(error: PlaybackErrorShape): boolean {
	return (
		error.status === 403 ||
		error.code === "forbidden" ||
		(typeof error.message === "string" && (error.message.includes("administratora") || error.message.includes("admin")))
	);
}

const getStoredVolume = (): number => {
	if (typeof window === "undefined") return 1;

	try {
		const stored = localStorage.getItem("reelvault:player:volume");
		if (stored !== null) {
			const parsed = Number.parseFloat(stored);
			if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= MAX_PLAYER_VOLUME) return parsed;
		}
	} catch {
		// ignore
	}

	return 1;
};

const getStoredMuted = (): boolean => {
	if (typeof window === "undefined") return false;

	try {
		return localStorage.getItem("reelvault:player:muted") === "true";
	} catch {
		// ignore
	}

	return false;
};

const PLAYBACK_RATE_STORAGE_KEY = "reelvault:player:playbackRate";

const getStoredPlaybackRate = (): number => {
	if (typeof window === "undefined") return 1;

	try {
		const parsed = Number.parseFloat(localStorage.getItem(PLAYBACK_RATE_STORAGE_KEY) ?? "");
		if (Number.isNaN(parsed)) return 1;

		return Math.min(2, Math.max(0.25, parsed));
	} catch {
		return 1;
	}
};

/**
 * Owns the volume/mute/playback-rate state on behalf of the provider
 * (PlayerVolumeContext). Kept next to the controller because the setters
 * write through to <video> using the audio-pipeline helpers; the provider
 * passes the returned slice back into usePlayerController and publishes the
 * primitives through a dedicated context so volume-only consumers (equalizer,
 * settings menu, footer) never re-render on unrelated playback state.
 */
export interface PlayerVolumeState {
	volume: number;
	isMuted: boolean;
	playbackRate: number;
	setVolume: (value: number) => void;
	setMuted: (muted: boolean) => void;
	setPlaybackRate: (rate: number) => void;
}

export function usePlayerVolumeState(videoRef: RefObject<HTMLVideoElement | null>): PlayerVolumeState {
	const [volume, setVolumeState] = useState<number>(getStoredVolume);
	const [isMuted, setIsMutedState] = useState<boolean>(getStoredMuted);
	const [playbackRate, setPlaybackRateState] = useState(getStoredPlaybackRate);

	const setVolume = (value: number) => {
		const clamped = Math.max(0, Math.min(MAX_PLAYER_VOLUME, value));
		const video = videoRef.current;
		if (video) {
			const eqConfig = getStoredEqualizerConfig();
			const pipelineActive = isAudioPipelineActive(video) || clamped > 1 || isEqualizerActive(eqConfig);

			if (pipelineActive) {
				// Web Audio owns volume entirely once active — native volume must
				// stay pinned at 1, or the two multiply together.
				video.volume = 1;
				applyAudioPipeline(video, clamped, eqConfig);
			} else {
				video.volume = clamped;
			}
		}

		setVolumeState(clamped);
		try {
			localStorage.setItem("reelvault:player:volume", String(clamped));
		} catch {
			// ignore
		}
	};

	const setMuted = (muted: boolean) => {
		if (videoRef.current) videoRef.current.muted = muted;

		setIsMutedState(muted);
		try {
			localStorage.setItem("reelvault:player:muted", String(muted));
		} catch {
			// ignore
		}

		if (!muted && volume === 0) {
			setVolume(0.5);
		}
	};

	const setPlaybackRate = (rate: number) => {
		if (videoRef.current) videoRef.current.playbackRate = rate;

		setPlaybackRateState(rate);
		try {
			localStorage.setItem(PLAYBACK_RATE_STORAGE_KEY, String(rate));
		} catch {
			// ignore
		}
	};

	// Sync stored volume/muted/rate (localStorage) onto the native element on mount —
	// state alone never reaches <video> until the user touches the controls.
	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		const eqConfig = getStoredEqualizerConfig();
		const pipelineActive = isAudioPipelineActive(video) || volume > 1 || isEqualizerActive(eqConfig);

		video.volume = pipelineActive ? 1 : Math.min(1, volume);
		video.muted = isMuted;
		video.playbackRate = playbackRate;

		if (pipelineActive) {
			applyAudioPipeline(video, volume, eqConfig);
		}
	}, [videoRef, volume, isMuted, playbackRate]);

	return { volume, isMuted, playbackRate, setVolume, setMuted, setPlaybackRate };
}

export function usePlayerController({
	mediaFileId,
	mediaFile,
	session,
	sessionId,
	playbackConfigKey,
	onSessionExpired,
	settings,
	profileId,
	profilePreferences,
	timeStore,
	videoRef,
	volumeState,
}: {
	mediaFileId: string;
	mediaFile: PlayerMediaFile;
	session: PlayerSession;
	sessionId: string;
	playbackConfigKey: string;
	onSessionExpired: () => Promise<void>;
	settings: PlaybackSettings;
	profileId: string | undefined;
	timeStore: PlayerTimeStore;
	/** Owned by the provider — shared <video> element ref. */
	videoRef: RefObject<HTMLVideoElement | null>;
	/** Owned by the provider (PlayerVolumeContext state) — see usePlayerVolumeState. */
	volumeState: PlayerVolumeState;
	profilePreferences:
		| {
				autoplay?: boolean;
				autoSkipIntro?: boolean;
				autoSkipCredits?: boolean;
				autoSkipRecap?: boolean;
				subtitleSize?: SubtitlePreferences["subtitleSize"];
				subtitlePosition?: SubtitlePreferences["subtitlePosition"];
				subtitleColor?: SubtitlePreferences["subtitleColor"];
				subtitleBackground?: SubtitlePreferences["subtitleBackground"];
				subtitleLanguage?: string | null;
		  }
		| undefined;
}) {
	// -------------------------------------------------------------------------
	// Core refs
	// -------------------------------------------------------------------------

	/** Ref to the native <video> element. */
	/** Ref to the active Hls instance — set by AppPlayerSurface after mount. */
	const hlsRef = useRef<Hls | null>(null);
	const queryClient = useQueryClient();

	const currentTimeRef = useRef(0);
	const restoredPlaybackConfigRef = useRef<string | null>(null);
	const pendingSeekPositionRef = useRef<number | null>(null);
	const streamStartTimeRef = useRef(0);
	const hasStartedInitialResumeRef = useRef(false);
	/** True once the restored (saved) position has actually landed on the <video>. */
	const hasAppliedInitialResumeRef = useRef(false);
	const lastPositionBeforeConfigChangeRef = useRef(0);
	const isRecoveringSessionRef = useRef(false);
	const isTerminatedRef = useRef(false);
	const isMountedRef = useRef(true);

	useEffect(() => {
		isMountedRef.current = true;
		const video = videoRef.current;

		return () => {
			isMountedRef.current = false;
			if (video) {
				disposeAudioBoost(video);
			}
		};
	}, [videoRef]);

	const onSessionExpiredRef = useRef(onSessionExpired);
	useEffect(() => {
		onSessionExpiredRef.current = onSessionExpired;
	}, [onSessionExpired]);

	// -------------------------------------------------------------------------
	// Playback state
	// -------------------------------------------------------------------------

	const [playlistRevision, setPlaylistRevision] = useState(0);
	// Playhead lives in timeStore (external store) — see usePlayerTime. Only
	// marker enter/exit transitions stay in React state.
	const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
	const activeMarkerIdRef = useRef<string | null>(null);
	const [bufferedRanges, setBufferedRanges] = useState<BufferedRange[]>([]);
	const [canPlay, setCanPlay] = useState(false);
	const [isBuffering, setIsBuffering] = useState(true);
	const [playerError, setPlayerError] = useState(false);
	const [isPaused, setIsPaused] = useState(true);
	// Values live in PlayerVolumeContext (provider-owned); the controller drives the element through the setters only.
	const { setVolume, setMuted, setPlaybackRate } = volumeState;
	const [isNextEpisodeDismissed, setIsNextEpisodeDismissed] = useState(false);
	const isNextEpisodeDismissedRef = useRef(false);
	useEffect(() => {
		isNextEpisodeDismissedRef.current = isNextEpisodeDismissed;
	}, [isNextEpisodeDismissed]);
	const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
	const initialSubtitleId = session.subtitlesEnabled && session.subtitleId ? session.subtitleId : undefined;
	const [selectedSubtitleId, setSelectedSubtitleId] = useState<string | undefined>(initialSubtitleId);
	// Default search language comes from the profile preferences (server data),
	// not a hardcoded locale.
	const [subtitleLanguage, setSubtitleLanguage] = useState(profilePreferences?.subtitleLanguage ?? "en");
	const [subtitleOffset, setSubtitleOffset] = useState<number>(0);
	const [isDocumentVisible, setIsDocumentVisible] = useState(
		() => typeof document === "undefined" || document.visibilityState === "visible",
	);

	useEffect(() => {
		const handleVisibility = () => setIsDocumentVisible(document.visibilityState === "visible");
		document.addEventListener("visibilitychange", handleVisibility);

		return () => document.removeEventListener("visibilitychange", handleVisibility);
	}, []);

	const adjustSubtitleOffset = (delta: number) => {
		setSubtitleOffset((prev) => {
			const next = Math.round((prev + delta) * 10) / 10;

			return Math.min(10, Math.max(-10, next));
		});
	};

	// -------------------------------------------------------------------------
	// Buffered ranges — read directly from the <video> element's TimeRanges.
	// -------------------------------------------------------------------------

	const refreshBufferedRanges = () => {
		const video = videoRef.current;
		if (!video) return;

		const buf = video.buffered;
		const streamStart = streamStartTimeRef.current;
		const ranges: BufferedRange[] = [];
		for (let i = 0; i < buf.length; i++) {
			ranges.push({
				startTime: streamStart + buf.start(i),
				endTime: streamStart + buf.end(i),
			});
		}

		// "timeupdate"/"progress" fire constantly while the buffer is unchanged —
		// bail out with the previous array so React can skip the re-render.
		setBufferedRanges((prev) => {
			if (prev.length !== ranges.length) return ranges;

			for (let i = 0; i < prev.length; i++) {
				const prevRange = prev[i];
				const nextRange = ranges[i];
				if (!(prevRange && nextRange)) return ranges;

				if (prevRange.startTime !== nextRange.startTime || prevRange.endTime !== nextRange.endTime) return ranges;
			}

			return prev;
		});
	};

	// -------------------------------------------------------------------------
	// Queries & mutations
	// -------------------------------------------------------------------------

	const playbackQuery = usePlaybackProgress(mediaFile.metadataId);
	// TV-series-only data: both hooks key off episodeId, so movies skip these
	// requests entirely.
	const seasonsQuery = useSeasons(mediaFile.episodeId ? mediaFile.metadataId : "");
	const subtitlesQuery = usePlayerSubtitles(mediaFileId);
	const diagnosticsQuery = usePlaybackDiagnostics(sessionId, isDiagnosticsOpen, DIAGNOSTICS_POLL_INTERVAL_MS);
	// Server ranges show how far the transcode has gotten (the bar's buffered
	// overlay can span hours); hls.js only appends ~30-60 s to video.buffered.
	const transcodeProgressQuery = useTranscodeProgress(sessionId, isDocumentVisible);
	const transcodedRanges: BufferedRange[] =
		transcodeProgressQuery.data?.ranges.map((range) => ({ startTime: range.startTime, endTime: range.endTime })) ?? EMPTY_BUFFERED_RANGES;

	// seek reads the ranges through a ref so its closure (and the actions slice
	// that exposes it) keeps a stable identity between transcode polls.
	const transcodedRangesRef = useRef<BufferedRange[]>(EMPTY_BUFFERED_RANGES);
	useEffect(() => {
		transcodedRangesRef.current = transcodedRanges;
	}, [transcodedRanges]);

	// After a server-side seek the encode restarts from the new position and the
	// old ranges are wiped on disk — drop the cached ones too, so the bar stops
	// drawing a stale pre-seek span and isSafeSeek stops trusting it. The next
	// poll (or the explicit refetch below) repopulates from the fresh playlist.
	const clearTranscodedRanges = useCallback(() => {
		queryClient.setQueryData(playbackSessionKeys.transcodeProgress(sessionId), (prev: TranscodeProgressResponse | undefined) =>
			prev ? { ...prev, ranges: [], transcodedSeconds: 0, transcodedUntil: 0, progressPercent: 0 } : prev,
		);
		transcodedRangesRef.current = EMPTY_BUFFERED_RANGES;
	}, [queryClient, sessionId]);

	const playbackQueryRef = useRef(playbackQuery);
	useEffect(() => {
		playbackQueryRef.current = playbackQuery;
	}, [playbackQuery]);

	// Memoized so effect dependencies and query consumers keep a stable identity
	// while the query holds no data (a fresh [] per render would re-fire effects).
	const subtitles = useMemo(() => subtitlesQuery.data?.data ?? [], [subtitlesQuery.data]);
	const selectedSubtitle = subtitles.find((subtitle) => subtitle.id === selectedSubtitleId);
	const subtitleFormat = toCaptionFormat(selectedSubtitle?.format);

	const subtitleContentQuery = useSubtitleContent(selectedSubtitle?.id);
	const subtitleSearchMutation = useSubtitleSearch(mediaFileId, subtitleLanguage);

	const subtitleCandidates = subtitleSearchMutation.data?.flatMap((response) =>
		response.results.map((result) => ({ providerId: response.providerId, ...result })),
	);

	const [downloadingCandidateId, setDownloadingCandidateId] = useState<string | null>(null);

	const subtitleDownloadMutation = useSubtitleDownload(mediaFileId, (subId) => {
		setSelectedSubtitleId(subId);
		setDownloadingCandidateId(null);
		toast.success(m.player_subtitles_downloaded_enabled());
	});

	const downloadSubtitle = (providerId: string, subtitleId: string) => {
		const key = `${providerId}:${subtitleId}`;
		setDownloadingCandidateId(key);
		toast.loading(m.player_downloading_subtitles(), { id: "download-subtitle" });
		subtitleDownloadMutation.mutate(
			{ providerId, subtitleId },
			{
				onSuccess: () => {
					toast.dismiss("download-subtitle");
				},
				onError: () => {
					setDownloadingCandidateId(null);
					toast.error(m.player_subtitles_download_failed(), { id: "download-subtitle" });
				},
			},
		);
	};

	// -------------------------------------------------------------------------
	// Markers & playhead writes — applyTime must exist before the seek/restore
	// paths below because every time transition routes through it. Defined as a
	// stable callback (markers identity is stable) so it can be listed in effect
	// and callback dependencies without re-firing them.
	// -------------------------------------------------------------------------

	const markersQuery = useQuery({
		queryKey: mediaKeys.markers(mediaFileId),
		queryFn: () => reelvault.media.getMarkers(mediaFileId),
		staleTime: 5 * 60 * 1000,
	});

	const markers = markersQuery.data ?? EMPTY_MEDIA_MARKERS;

	const applyTime = useCallback(
		(absoluteTime: number) => {
			currentTimeRef.current = absoluteTime;
			timeStore.set(absoluteTime);
			const nextMarkerId = markers.find((marker) => absoluteTime >= marker.startSeconds && absoluteTime < marker.endSeconds)?.id ?? null;
			if (nextMarkerId !== activeMarkerIdRef.current) {
				activeMarkerIdRef.current = nextMarkerId;
				setActiveMarkerId(nextMarkerId);
			}
		},
		[markers, timeStore],
	);

	// -------------------------------------------------------------------------
	// Initial resume position
	// -------------------------------------------------------------------------

	// Server returns per-file playback status (fileProgress); just index into it.
	const playbackProgress = playbackQuery.data?.fileProgress[mediaFileId] ?? undefined;
	const rawPosition = playbackProgress?.progress?.position ?? 0;
	const isNearEnd = mediaFile.duration && mediaFile.duration > 0 ? rawPosition >= mediaFile.duration - 5 : false;
	const initialPosition = playbackProgress?.progress?.completed || isNearEnd ? 0 : rawPosition;

	const initialPositionRef = useRef(initialPosition);
	useEffect(() => {
		initialPositionRef.current = initialPosition;
	}, [initialPosition]);

	// Hold playback at the first canplay while a saved position still needs to be
	// restored, so the video doesn't visibly start from 0 and jump forward later.
	const isPlaybackHeld = () => initialPositionRef.current > 0 && !hasAppliedInitialResumeRef.current;

	const settingsRef = useRef(settings);
	useEffect(() => {
		settingsRef.current = settings;
	}, [settings]);

	const selectedSubtitleIdRef = useRef(selectedSubtitleId);
	useEffect(() => {
		selectedSubtitleIdRef.current = selectedSubtitleId;
	}, [selectedSubtitleId]);

	// Languages of the tracks the user is actually watching — persisted with the
	// progress so the whole title/series remembers them (pkt: per-series prefs).
	const audioLanguageRef = useRef<string | null>(null);
	useEffect(() => {
		const index = settings.audioStreamIndex ?? session.audioStreamIndex;
		audioLanguageRef.current = mediaFile.audioStreams.find((stream) => stream.index === index)?.language ?? null;
	}, [mediaFile.audioStreams, settings.audioStreamIndex, session.audioStreamIndex]);

	const subtitleLanguageRef = useRef<string | null>(null);
	useEffect(() => {
		subtitleLanguageRef.current = subtitles.find((subtitle) => subtitle.id === selectedSubtitleId)?.language ?? null;
	}, [subtitles, selectedSubtitleId]);

	// The server resolves the smart selection (profile preferences, per-title
	// languages, saved per-title choice) into session.subtitleId — the client
	// mirrors that decision instead of re-running its own language match. The
	// initializer captures it; no later effect re-applies it, so a session
	// created by an audio/quality switch keeps the user's current selection.	// -------------------------------------------------------------------------
	// Reset on quality/audio change
	// -------------------------------------------------------------------------

	const lastResetConfigKeyRef = useRef<string | null>(null);

	// react-doctor-disable-next-line react-doctor/no-adjust-state-on-prop-change -- reset player buffering state on transcode quality/audio switch
	useEffect(() => {
		// The reset is keyed to playbackConfigKey: stable dependencies (applyTime,
		// videoRef) may change identity mid-session without a config change, and
		// those runs must stay no-ops.
		if (lastResetConfigKeyRef.current === playbackConfigKey) return;

		lastResetConfigKeyRef.current = playbackConfigKey;
		const video = videoRef.current;
		const localOffset = video ? video.currentTime : 0;
		const currentPos = currentTimeRef.current;

		const hasValidBuffer = video && currentPos > 0 ? hasBufferAt(video, localOffset) : false;

		if (currentPos > 0) {
			lastPositionBeforeConfigChangeRef.current = currentPos;
		}

		if (!hasValidBuffer) {
			streamStartTimeRef.current = 0;
			pendingSeekPositionRef.current = null;
			// react-doctor-disable-next-line react-doctor/no-adjust-state-on-prop-change
			applyTime(0);
			// react-doctor-disable-next-line react-doctor/no-adjust-state-on-prop-change
			setBufferedRanges([]);
			// react-doctor-disable-next-line react-doctor/no-adjust-state-on-prop-change
			setCanPlay(false);
			// react-doctor-disable-next-line react-doctor/no-adjust-state-on-prop-change
			setIsBuffering(true);
			// react-doctor-disable-next-line react-doctor/no-adjust-state-on-prop-change
			setPlayerError(false);
			// react-doctor-disable-next-line react-doctor/no-adjust-state-on-prop-change
			setIsDiagnosticsOpen(false);
			hasStartedInitialResumeRef.current = false;
			hasAppliedInitialResumeRef.current = false;
		} else {
			// react-doctor-disable-next-line react-doctor/no-adjust-state-on-prop-change
			setPlayerError(false);
			hasStartedInitialResumeRef.current = false;
		}
	}, [applyTime, playbackConfigKey, videoRef]);

	// -------------------------------------------------------------------------
	// Restore playback position (after playlist reload or seek)
	// -------------------------------------------------------------------------

	const restorePlaybackPosition = useCallback(() => {
		const pendingPosition = pendingSeekPositionRef.current;
		const position = pendingPosition ?? currentTimeRef.current;
		if (position <= 0 || (!pendingPosition && restoredPlaybackConfigRef.current === playbackConfigKey) || !videoRef.current) return;

		const localOffset = Math.max(0, position - streamStartTimeRef.current);
		if (Math.abs(videoRef.current.currentTime - localOffset) > 0.5) {
			videoRef.current.currentTime = localOffset;
		}

		applyTime(position);
		pendingSeekPositionRef.current = null;
		restoredPlaybackConfigRef.current = playbackConfigKey;
		if (pendingPosition !== null) {
			hasAppliedInitialResumeRef.current = true;
		}
	}, [applyTime, playbackConfigKey, videoRef]);

	useEffect(() => {
		restorePlaybackPosition();
	}, [restorePlaybackPosition]);

	// -------------------------------------------------------------------------
	const lastSyncedPositionRef = useRef<number | null>(null);
	const lastForcedSaveAtRef = useRef(0);

	const syncPlaybackProgress = useCallback(
		async (force = false) => {
			const position = currentTimeRef.current;
			if (typeof position !== "number" || !Number.isFinite(position) || position <= 0) return;

			if (!force && lastSyncedPositionRef.current !== null && Math.abs(position - lastSyncedPositionRef.current) < 1) {
				return;
			}

			// Tab close fires pagehide + beforeunload AND the unmount cleanup — one save
			// per burst is enough (same position, same payload).
			if (force && Date.now() - lastForcedSaveAtRef.current < 1500) return;

			if (force) lastForcedSaveAtRef.current = Date.now();

			lastSyncedPositionRef.current = position;
			try {
				await savePlaybackProgress(mediaFileId, position, {
					audioStreamIndex: settingsRef.current.audioStreamIndex,
					// Explicit null: "subtitles off" must overwrite the saved per-title id
					// (undefined would be dropped from the JSON body and keep the old value).
					subtitleId: selectedSubtitleIdRef.current ?? null,
					audioLanguage: audioLanguageRef.current,
					subtitleLanguage: subtitleLanguageRef.current,
				});
				await Promise.all([
					queryClient.invalidateQueries({ queryKey: mePlaybackKeys.continueWatching() }),
					queryClient.invalidateQueries({ queryKey: mePlaybackKeys.progressAll() }),
					queryClient.invalidateQueries({ queryKey: mePlaybackKeys.suggestionsAll() }),
					queryClient.invalidateQueries({ queryKey: watchedHistoryKeys.listAll() }),
				]);
			} catch (error) {
				console.error("Failed to sync playback progress:", error);
			}
		},
		[mediaFileId, queryClient],
	);

	const navigate = useNavigate();
	const location = useLocation();

	const leavePlayer = useCallback(async () => {
		if (document.fullscreenElement) {
			try {
				await document.exitFullscreen();
			} catch (error: unknown) {
				console.error(error);
			}
		}

		try {
			await syncPlaybackProgress(true);
		} catch (error) {
			console.error("Failed to sync playback progress before leaving player:", error);
		}

		if (typeof window !== "undefined" && window.history.length > 1) {
			window.history.back();
		} else {
			// Player opened in a fresh tab — no history to go back to.
			await navigate({ to: "/" });
		}
	}, [navigate, syncPlaybackProgress]);

	const handleSessionTerminated = useCallback(
		(reason?: string) => {
			if (!isMountedRef.current || isTerminatedRef.current) return;

			isTerminatedRef.current = true;
			if (videoRef.current) {
				videoRef.current.pause();
				videoRef.current.removeAttribute("src");
				videoRef.current.load();
			}

			if (hlsRef.current) {
				hlsRef.current.destroy();
				hlsRef.current = null;
			}

			if (typeof window !== "undefined" && window.location.pathname.startsWith("/player")) {
				const message = reason ?? m.player_stopped_by_server_admin();
				toast.error(message, { duration: 6000 });
				detach(() => syncPlaybackProgress(true));
				detach(leavePlayer);
			}
		},
		[leavePlayer, syncPlaybackProgress, videoRef],
	);

	// -------------------------------------------------------------------------
	// Session expiry recovery
	// -------------------------------------------------------------------------

	// Local helper (fresh function scope) so the ref freshness checks in the
	// recovery path are not skewed by earlier narrowing in the same function.
	const surfaceRecoveryFailure = useCallback(() => {
		if (!isMountedRef.current || isTerminatedRef.current) return;

		// Surface the failure instead of hanging on the loading spinner — the
		// error overlay's m.admin_resume() button re-runs this recovery.
		setPlayerError(true);
	}, []);

	const reconnectAfterSessionExpiry = useCallback(async () => {
		if (!isMountedRef.current || isRecoveringSessionRef.current || isTerminatedRef.current) return;

		if (typeof window !== "undefined" && !window.location.pathname.startsWith("/player")) return;

		isRecoveringSessionRef.current = true;
		try {
			let currentPos = currentTimeRef.current;
			if (currentPos <= 0) {
				currentPos = lastPositionBeforeConfigChangeRef.current > 0 ? lastPositionBeforeConfigChangeRef.current : initialPositionRef.current;
			}

			if (currentPos > 0) {
				lastPositionBeforeConfigChangeRef.current = currentPos;
				try {
					await savePlaybackProgress(mediaFileId, currentPos, {
						audioStreamIndex: settingsRef.current.audioStreamIndex,
						subtitleId: selectedSubtitleIdRef.current ?? null,
						audioLanguage: audioLanguageRef.current,
						subtitleLanguage: subtitleLanguageRef.current,
					});
				} catch {
					// Ignore network errors when saving before reconnect
				}
			}

			hasStartedInitialResumeRef.current = false;
			await onSessionExpiredRef.current();
		} catch (err) {
			const error = toPlaybackError(err);
			if (isForbiddenPlaybackError(error)) {
				handleSessionTerminated(error.message);
			} else {
				surfaceRecoveryFailure();
			}
		} finally {
			isRecoveringSessionRef.current = false;
		}
	}, [handleSessionTerminated, mediaFileId, surfaceRecoveryFailure]);

	// -------------------------------------------------------------------------
	// Time update — rAF-batched to avoid flooding React with every frame
	// -------------------------------------------------------------------------

	const rafIdRef = useRef(0);
	const pendingTimeRef = useRef(0);

	const updatePlaybackTime = (videoCurrentTime: number) => {
		const safeVideoTime = typeof videoCurrentTime === "number" && Number.isFinite(videoCurrentTime) ? Math.max(0, videoCurrentTime) : 0;
		const absoluteTime = streamStartTimeRef.current + safeVideoTime;
		currentTimeRef.current = absoluteTime;
		pendingTimeRef.current = absoluteTime;
		if (!rafIdRef.current) {
			rafIdRef.current = requestAnimationFrame(() => {
				rafIdRef.current = 0;
				applyTime(pendingTimeRef.current);
			});
		}
	};

	const getAbsoluteTime = (videoCurrentTime: number) => streamStartTimeRef.current + videoCurrentTime;

	// -------------------------------------------------------------------------
	// Seek
	// -------------------------------------------------------------------------

	const pendingSeekAbortRef = useRef<AbortController | null>(null);

	const seek = useCallback(
		// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: seek branches on buffered-range heuristics; splitting them would reshuffle the hls.js seek sequence
		async (position: number) => {
			const duration = mediaFile.duration ?? position;
			const targetPosition = Math.max(0, Math.min(position, duration));
			if (targetPosition === currentTimeRef.current && canPlay) return;

			pendingSeekAbortRef.current?.abort();
			const controller = new AbortController();
			pendingSeekAbortRef.current = controller;

			const video = videoRef.current;
			const targetLocalOffset = video ? targetPosition - streamStartTimeRef.current : -1;

			// Target sits in browser buffer or server transcoded ranges → seek locally;
			// a server round-trip risks a full stream reload for a skip existing data can serve.
			if (video && targetLocalOffset >= 0 && isSafeSeek(targetPosition, streamStartTimeRef.current, video, transcodedRangesRef.current)) {
				const localOffset = Math.max(0, targetLocalOffset);
				if (Math.abs(video.currentTime - localOffset) > 0.5) {
					video.currentTime = localOffset;
				}

				applyTime(targetPosition);
				pendingSeekPositionRef.current = null;
				setCanPlay(true);
				setIsBuffering(false);
				if (initialPositionRef.current > 0 && !hasAppliedInitialResumeRef.current) {
					// This seek was the initial resume — no later canplay will start
					// playback, so do it here (mirrors the reusedBuffer path).
					hasAppliedInitialResumeRef.current = true;
					detach(async () => {
						try {
							await video.play();
						} catch (err: unknown) {
							console.warn("Autoplay was blocked or deferred:", err);
							setIsPaused(true);
						}
					});
				}

				return;
			}

			const currentLocalOffset = video ? video.currentTime : 0;
			const currentAbsolutePos = streamStartTimeRef.current + currentLocalOffset;

			let browserHasBufferForCurrent = false;
			if (video && Math.abs(targetPosition - currentAbsolutePos) < 2) {
				browserHasBufferForCurrent = hasBufferAt(video, currentLocalOffset);
			}

			if (!browserHasBufferForCurrent) {
				pendingSeekPositionRef.current = targetPosition;
				applyTime(targetPosition);
				setIsBuffering(true);
			}

			try {
				const response = await seekPlaybackSession(sessionId, targetPosition);
				if (controller.signal.aborted) return;

				streamStartTimeRef.current = response.startTime;
				applyTime(response.position);

				if (response.reusedBuffer) {
					const localOffset = Math.max(0, response.position - response.startTime);

					if (video) {
						pendingSeekPositionRef.current = null;
						if (Math.abs(video.currentTime - localOffset) > 0.5) {
							video.currentTime = localOffset;
						}

						setCanPlay(true);
						if (initialPositionRef.current > 0 && !hasAppliedInitialResumeRef.current) {
							// This seek is the initial resume and took the no-reload path —
							// no later canplay will start playback, so do it here.
							hasAppliedInitialResumeRef.current = true;
							setIsBuffering(false);
							if (isMountedRef.current && !isTerminatedRef.current) {
								detach(async () => {
									try {
										await video.play();
									} catch (err: unknown) {
										console.warn("Autoplay was blocked or deferred:", err);
										setIsPaused(true);
									}
								});
							}
						} else {
							setIsBuffering(false);
						}
					} else {
						pendingSeekPositionRef.current = response.position;
						setCanPlay(false);
						setPlaylistRevision((revision) => revision + 1);
						detach(() => transcodeProgressQuery.refetch());
					}
				} else {
					// The server wiped and restarted transcodes/<sessionId>. The cached
					// server ranges are stale now and would make isSafeSeek trust a
					// range that no longer exists; drop them until the poll repopulates.
					clearTranscodedRanges();
					pendingSeekPositionRef.current = response.position;
					setPlaylistRevision((revision) => revision + 1);
					detach(() => transcodeProgressQuery.refetch());
				}
			} catch (error) {
				if (controller.signal.aborted) return;

				pendingSeekPositionRef.current = null;
				setIsBuffering(false);
				throw error;
			}
		},
		[applyTime, canPlay, clearTranscodedRanges, mediaFile.duration, sessionId, transcodeProgressQuery, videoRef],
	);

	// -------------------------------------------------------------------------
	// Initial resume (once canPlay fires for the first time)
	// -------------------------------------------------------------------------

	useEffect(() => {
		if (!canPlay || hasStartedInitialResumeRef.current) return;

		const resumePosition = lastPositionBeforeConfigChangeRef.current > 0 ? lastPositionBeforeConfigChangeRef.current : initialPosition;
		if (resumePosition <= 0) return;

		hasStartedInitialResumeRef.current = true;
		// react-doctor-disable-next-line react-doctor/no-pass-live-state-to-parent
		detach(async () => {
			try {
				await seek(resumePosition);
			} catch (error: unknown) {
				// Release the hold and start from the beginning rather than staying stuck.
				hasAppliedInitialResumeRef.current = true;
				console.error("Initial resume seek failed:", error);
				const video = videoRef.current;
				if (video) {
					try {
						await video.play();
					} catch (playError: unknown) {
						console.warn("Autoplay was blocked or deferred:", playError);
						setIsPaused(true);
					}
				}
			}
		});
	}, [canPlay, initialPosition, seek, videoRef]);

	// -------------------------------------------------------------------------
	// Heartbeat & teardown
	// -------------------------------------------------------------------------

	useInterval({
		callback: () => {
			if (!isMountedRef.current || isTerminatedRef.current) return;

			if (typeof window !== "undefined" && !window.location.pathname.startsWith("/player")) return;

			// One request for liveness + piggy-backed progress — the server persists
			// the position (and subtitle/audio selection) with the heartbeat.
			detach(async () => {
				try {
					await reelvault.playbackSessions.keepAlive(sessionId, {
						position: currentTimeRef.current,
						subtitleId: selectedSubtitleIdRef.current ?? null,
						audioStreamIndex: settingsRef.current.audioStreamIndex,
						duration: mediaFile.duration ?? null,
						isPaused,
					});
				} catch (err: unknown) {
					if (!isMountedRef.current) return;

					const error = toPlaybackError(err);
					if (isForbiddenPlaybackError(error)) {
						handleSessionTerminated(error.message);

						return;
					}

					console.warn("Heartbeat keepAlive failed, reconnecting...", err);
					detach(reconnectAfterSessionExpiry);
				}
			});
		},
		delay: HEARTBEAT_INTERVAL_MS,
	});

	const lastProgressFlushAtRef = useRef(0);

	/**
	 * One departure (tab close, navigate away, unmount) can fire visibilitychange,
	 * pagehide, beforeunload AND the effect cleanup — collapse those into a single
	 * forced save within a short window.
	 */
	const flushProgressOnce = useCallback((): Promise<void> => {
		const now = Date.now();
		if (now - lastProgressFlushAtRef.current < PROGRESS_FLUSH_DEDUPE_MS) return Promise.resolve();

		lastProgressFlushAtRef.current = now;

		return syncPlaybackProgress(true);
	}, [syncPlaybackProgress]);

	useEffect(() => {
		const video = videoRef.current;
		const handleVisibilityChange = () => {
			if (!isMountedRef.current) return;

			if (document.visibilityState === "hidden") {
				// Hidden-tab timers get throttled (to ~1/min or worse when paused) — the
				// piggy-backed save here must not depend on the interval firing on time.
				detach(() => flushProgressOnce());
				detach(() => reelvault.playbackSessions.keepAlive(sessionId));
			} else {
				if (isTerminatedRef.current) return;

				if (typeof window !== "undefined" && !window.location.pathname.startsWith("/player")) return;

				detach(async () => {
					try {
						await reelvault.playbackSessions.keepAlive(sessionId);
					} catch (err: unknown) {
						if (!isMountedRef.current) return;

						const error = toPlaybackError(err);
						if (isForbiddenPlaybackError(error)) {
							handleSessionTerminated(error.message);

							return;
						}

						console.warn("Session expired while tab was hidden, reconnecting...", err);
						detach(reconnectAfterSessionExpiry);
					}
				});
			}
		};

		const handlePageHide = () => {
			detach(() => flushProgressOnce());
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);
		window.addEventListener("pagehide", handlePageHide);
		window.addEventListener("beforeunload", handlePageHide);

		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			window.removeEventListener("pagehide", handlePageHide);
			window.removeEventListener("beforeunload", handlePageHide);
			if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);

			if (video) {
				video.pause();
				video.removeAttribute("src");
				video.load();
			}

			if (hlsRef.current) {
				hlsRef.current.destroy();
				hlsRef.current = null;
			}

			detach(async () => {
				await flushProgressOnce();
				try {
					await Promise.all([
						queryClient.invalidateQueries({ queryKey: mePlaybackKeys.continueWatching() }),
						queryClient.invalidateQueries({ queryKey: mePlaybackKeys.progressAll() }),
						queryClient.invalidateQueries({ queryKey: mePlaybackKeys.suggestionsAll() }),
						queryClient.invalidateQueries({ queryKey: watchedHistoryKeys.listAll() }),
					]);
				} catch (error: unknown) {
					console.error("Failed to invalidate playback queries after flush:", error);
				}
			});
		};
	}, [flushProgressOnce, handleSessionTerminated, queryClient, reconnectAfterSessionExpiry, sessionId, videoRef]);

	// -------------------------------------------------------------------------
	// Navigation & episodes
	// -------------------------------------------------------------------------

	const isCollectionMode = Boolean(location.search.collection);
	const collectionId = location.search.collectionId;

	const collectionDetailsQuery = useCollectionDetails(collectionId ?? "");
	const sortMode = collectionDetailsQuery.data?.sortMode ?? "release_date";
	const collectionQuery = useMetadataCollection(collectionId ?? undefined, {
		sortBy: sortMode === "manual" ? "collectionOrder" : "releaseDate",
		sortOrder: "asc",
	});
	const collectionItems = collectionQuery.data?.data ?? [];

	const currentMovieIndex =
		isCollectionMode && collectionItems.length > 0 ? collectionItems.findIndex((item) => item.id === mediaFile.metadataId) : -1;
	const nextMovieItem =
		isCollectionMode && currentMovieIndex !== -1 && currentMovieIndex < collectionItems.length - 1
			? collectionItems[currentMovieIndex + 1]
			: null;

	const nextMovieSuggestionQuery = usePlaybackSuggestion(nextMovieItem?.id ?? "");
	const nextMovieMediaFileId = nextMovieSuggestionQuery.data?.suggestion?.mediaFileId;

	const {
		currentEpisode,
		nextEpisode: seriesNextEpisode,
		isLoading: isNextEpisodeLoading,
	} = useNextEpisode({
		metadataId: mediaFile.episodeId ? mediaFile.metadataId : "",
		episodeId: mediaFile.episodeId,
		currentMediaFileId: mediaFileId,
	});

	// Memoized: the ref-sync effect below keys off this identity and the object
	// is re-created from the same inputs on unrelated renders otherwise.
	const nextEpisode = useMemo(
		() =>
			isCollectionMode && nextMovieItem && nextMovieMediaFileId
				? {
						episodeId: nextMovieItem.id,
						seasonNumber: 1,
						episodeNumber: currentMovieIndex + 2,
						title: nextMovieItem.title,
						mediaFileId: `${nextMovieMediaFileId}?collection=true&collectionId=${collectionId ?? ""}`,
					}
				: seriesNextEpisode,
		[collectionId, currentMovieIndex, isCollectionMode, nextMovieItem, nextMovieMediaFileId, seriesNextEpisode],
	);

	const nextEpisodeRef = useRef(nextEpisode);
	useEffect(() => {
		nextEpisodeRef.current = nextEpisode;
	}, [nextEpisode]);

	const profilePreferencesRef = useRef(profilePreferences);
	useEffect(() => {
		profilePreferencesRef.current = profilePreferences;
	}, [profilePreferences]);

	const playNextEpisode = () => {
		if (!isMountedRef.current) return;

		if (typeof window !== "undefined" && !window.location.pathname.startsWith("/player")) return;

		const targetEpisode = nextEpisodeRef.current;
		if (!targetEpisode?.mediaFileId) return;

		detach(() => syncPlaybackProgress(true));
		const cleanId = targetEpisode.mediaFileId.replace(PLAYER_PATH_PREFIX_REGEX, "").split("?")[0] ?? "";
		detach(() =>
			navigate({
				to: "/player/$id",
				params: { id: cleanId },
				replace: true,
			}),
		);
	};

	const onMediaEnd = () => {
		if (!isMountedRef.current) return;

		if (typeof window !== "undefined" && !window.location.pathname.startsWith("/player")) return;

		detach(() => syncPlaybackProgress(true));
		const prefs = profilePreferencesRef.current;
		if (prefs?.autoplay && nextEpisodeRef.current?.mediaFileId && !isNextEpisodeDismissedRef.current) {
			playNextEpisode();
		} else if (!nextEpisodeRef.current?.mediaFileId) {
			detach(leavePlayer);
		}
	};

	// -------------------------------------------------------------------------
	// Markers
	// -------------------------------------------------------------------------

	// -------------------------------------------------------------------------
	// Playhead writes — single entry point for every time transition (tick,
	// seek, restore, reset). Pushes to the external store and detects marker
	// enter/exit; React state updates only on those transitions.
	// -------------------------------------------------------------------------

	useEffect(() => {
		timeStore.setDuration(mediaFile.duration ?? 0);
	}, [timeStore, mediaFile.duration]);

	const activeMarker = markers.find((marker) => marker.id === activeMarkerId) ?? null;

	const skipActiveMarker = () => {
		if (activeMarker) {
			detach(() => seek(activeMarker.endSeconds));
		}
	};

	const lastAutoSkippedMarkerIdRef = useRef<string | null>(null);

	useEffect(() => {
		if (!(activeMarker && canPlay)) return;

		if (lastAutoSkippedMarkerIdRef.current === activeMarker.id) return;

		let shouldAutoSkip = false;
		if (activeMarker.type === "intro" && profilePreferences?.autoSkipIntro) {
			shouldAutoSkip = true;
		} else if (activeMarker.type === "credits" && profilePreferences?.autoSkipCredits) {
			shouldAutoSkip = true;
		} else if (activeMarker.type === "recap" && profilePreferences?.autoSkipRecap) {
			shouldAutoSkip = true;
		}

		if (shouldAutoSkip) {
			lastAutoSkippedMarkerIdRef.current = activeMarker.id;
			// react-doctor-disable-next-line react-doctor/no-pass-live-state-to-parent
			detach(() => seek(activeMarker.endSeconds));
		}
	}, [
		activeMarker,
		canPlay,
		profilePreferences?.autoSkipCredits,
		profilePreferences?.autoSkipIntro,
		profilePreferences?.autoSkipRecap,
		seek,
	]);

	useEffect(() => {
		if (!activeMarker) {
			lastAutoSkippedMarkerIdRef.current = null;
		}
	}, [activeMarker]);

	// -------------------------------------------------------------------------
	// Remote playback commands via WebSocket
	// -------------------------------------------------------------------------

	// Commands are routed only to WS clients subscribed to the HLS session id —
	// without this the player never receives its own remote commands.
	useEffect(() => {
		if (!sessionId) return noopCleanup;

		if (profileId) realtimeConnection.setProfileId(profileId);

		realtimeConnection.subscribeToSession(sessionId);

		return () => realtimeConnection.unsubscribeFromSession(sessionId);
	}, [sessionId, profileId]);

	useRealtimeEvent<{ sessionId?: string; command?: PlaybackCommand }>("playback:command", (data) => {
		if (data.sessionId === sessionId && data.command) {
			const cmd = data.command;
			switch (cmd.type) {
				case "play": {
					const video = videoRef.current;
					if (video) detach(() => video.play());

					break;
				}
				case "pause":
					videoRef.current?.pause();
					break;
				case "seek":
					if (typeof cmd.position === "number") {
						const targetPosition = cmd.position;
						detach(() => seek(targetPosition));
					} else if (typeof cmd.relative === "number") {
						const targetTime = Math.max(0, currentTimeRef.current + cmd.relative);
						detach(() => seek(targetTime));
					}

					break;
				case "stop":
					handleSessionTerminated();
					break;
				case "setVolume":
					if (typeof cmd.volume === "number") {
						setVolume(cmd.volume);
					}

					break;
				default:
					break;
			}
		}
	});

	useRealtimeEvent<{ sessionId?: string; startTime?: number }>("playback:session:seeked", (data) => {
		if (data.sessionId !== sessionId || typeof data.startTime !== "number") return;

		if (Math.abs(data.startTime - streamStartTimeRef.current) < 0.05) return;

		// The server restarted the stream on its own (out-of-window segment request) —
		// adopt the new timeline origin and reload the manifest at the live position.
		streamStartTimeRef.current = data.startTime;
		// The encode restarted at the new origin: stale server ranges must not keep
		// drawing on the bar (or feeding isSafeSeek) until the next poll repopulates.
		clearTranscodedRanges();
		pendingSeekPositionRef.current = currentTimeRef.current;
		setPlaylistRevision((revision) => revision + 1);
	});

	useRealtimeEvent<{ sessionId?: string; mediaFileId?: string; reason?: string }>("playback:session:terminated", (data) => {
		// Only this session's teardown ends playback here — another device watching
		// the same title must not kill our stream.
		if (data.sessionId === sessionId) {
			handleSessionTerminated(data.reason);
		}
	});

	// -------------------------------------------------------------------------
	// Memoized context slices
	// -------------------------------------------------------------------------

	const status = useMemo(() => ({ canPlay, isBuffering, playerError, isPaused }), [canPlay, isBuffering, playerError, isPaused]);

	const actions = {
		videoRef,
		hlsRef,
		seek,
		restorePlaybackPosition,
		isPlaybackHeld,
		syncPlaybackProgress,
		onMediaEnd,
		updatePlaybackTime,
		getAbsoluteTime,
		refreshBufferedRanges,
		setCanPlay,
		setIsBuffering,
		setIsPaused,
		setPlayerError,
		setVolume,
		setMuted,
		setPlaybackRate,
		reconnectAfterSessionExpiry,
		handleSessionTerminated,
	};

	const subtitleSize = profilePreferences?.subtitleSize ?? "normal";
	const subtitlePosition = profilePreferences?.subtitlePosition ?? "bottom";
	const subtitleColor = profilePreferences?.subtitleColor ?? "white";
	const subtitleBackground = profilePreferences?.subtitleBackground ?? "semi";

	const updateSubtitlePreferences = async (prefs: Partial<SubtitlePreferences>) => {
		if (!profileId) return;

		const updated = await reelvault.profiles.updatePreferences(profileId, prefs);
		queryClient.setQueryData(profileKeys.preferences(profileId), updated);
	};

	const subtitlesValue = {
		subtitles,
		selectedSubtitleId,
		setSelectedSubtitleId,
		selectedSubtitle,
		subtitleFormat,
		subtitleContent: subtitleContentQuery.data,
		subtitleLanguage,
		setSubtitleLanguage,
		subtitleCandidates,
		downloadingCandidateId,
		isSearchingSubtitles: subtitleSearchMutation.isPending,
		isSearchError: subtitleSearchMutation.isError,
		isDownloadingSubtitle: subtitleDownloadMutation.isPending,
		isDownloadError: subtitleDownloadMutation.isError,
		searchSubtitles: subtitleSearchMutation.mutate,
		downloadSubtitle,
		subtitleSize,
		subtitlePosition,
		subtitleColor,
		subtitleBackground,
		updateSubtitlePreferences,
		subtitleOffset,
		setSubtitleOffset,
		adjustSubtitleOffset,
	};

	const diagnosticsToggle = {
		isOpen: isDiagnosticsOpen,
		toggle: () => setIsDiagnosticsOpen((prev) => !prev),
		close: () => setIsDiagnosticsOpen(false),
	};

	const [clientMetrics, setClientMetrics] = useState<{
		videoWidth: number;
		videoHeight: number;
		totalFrames: number;
		droppedFrames: number;
		corruptedFrames: number;
		bandwidthEstimate?: number;
		bufferedSeconds: number;
	} | null>(null);

	useEffect(() => {
		if (!isDiagnosticsOpen) return noopCleanup;

		const updateMetrics = () => {
			const video = videoRef.current;
			if (!video) return;

			let clientBufferAhead = 0;
			const pos = video.currentTime;
			for (let i = 0; i < video.buffered.length; i++) {
				if (video.buffered.start(i) <= pos && video.buffered.end(i) >= pos) {
					clientBufferAhead = video.buffered.end(i) - pos;
					break;
				}
			}

			const quality =
				"getVideoPlaybackQuality" in video && typeof video.getVideoPlaybackQuality === "function" ? video.getVideoPlaybackQuality() : null;
			setClientMetrics({
				videoWidth: video.videoWidth || 0,
				videoHeight: video.videoHeight || 0,
				totalFrames: quality?.totalVideoFrames ?? 0,
				droppedFrames: quality?.droppedVideoFrames ?? 0,
				corruptedFrames: quality?.corruptedVideoFrames ?? 0,
				bandwidthEstimate: hlsRef.current?.bandwidthEstimate,
				bufferedSeconds: Math.max(0, Number(clientBufferAhead.toFixed(2))),
			});
		};

		updateMetrics();
		const interval = setInterval(updateMetrics, 1000);

		return () => clearInterval(interval);
	}, [isDiagnosticsOpen, videoRef]);

	const diagnosticsData = {
		diagnostics: diagnosticsQuery.data,
		isPending: diagnosticsQuery.isPending,
		isError: diagnosticsQuery.isError,
		clientMetrics,
	};

	const nextEpisodeValue = {
		currentEpisode,
		nextEpisode,
		isNextEpisodeLoading,
		playNextEpisode,
		isNextEpisodeDismissed,
		setIsNextEpisodeDismissed,
		autoplay: profilePreferences?.autoplay ?? false,
	};

	const markersValue = { markers, activeMarker, skipActiveMarker };

	return {
		playlistRevision,
		status,
		// Two distinct signals: transcodedRanges = server transcode progress (can span
		// hours), bufferedRanges = what hls.js actually appended to video.buffered.
		transcodedRanges,
		bufferedRanges,
		actions,
		subtitles: subtitlesValue,
		diagnosticsToggle,
		diagnosticsData,
		nextEpisode: nextEpisodeValue,
		markers: markersValue,
		seasons: seasonsQuery.data?.data ?? [],
		playback: playbackQuery.data,
	};
}
