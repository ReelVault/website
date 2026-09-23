import type Hls from "hls.js";
import { createContext, type ReactNode, type RefObject, useContext, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { MediaMarker, PlaybackDiagnostics } from "reelvault-sdk";
import { type BufferedRange, type PlayerVolumeState, usePlayerController, usePlayerVolumeState } from "./hooks/use-player-controller.hook";
import type {
	AudioStream,
	CaptionFormat,
	CurrentEpisodeInfo,
	NextEpisodeInfo,
	PlaybackSettings,
	PlaybackSettingsActions,
	PlayerMediaFile,
	PlayerSession,
	SubtitleBackground,
	SubtitleCandidate,
	SubtitleColor,
	SubtitleOption,
	SubtitlePosition,
	SubtitlePreferences,
	SubtitleSize,
} from "./utils/player.types";
import { createPlayerTimeStore, type PlayerTimeStore } from "./utils/player-time-store";

// Re-export BufferedRange so consumers can import from one place
export type { BufferedRange } from "./hooks/use-player-controller.hook";

// ---------------------------------------------------------------------------
// Helper: creates a typed context + hook with a built-in guard.
// ---------------------------------------------------------------------------

function createContextHook<T>(displayName: string) {
	const ctx = createContext<T | null>(null);
	ctx.displayName = displayName;

	function useHook() {
		const value = useContext(ctx);
		if (!value) throw new Error(`${displayName} must be used within a PlayerProvider`);

		return value;
	}

	return [ctx, useHook] as const;
}

// ---------------------------------------------------------------------------
// Time: updates on (roughly) every animation frame during playback.
//
// The playhead lives in an external store (player-time-store), NOT in React
// state — pushing ~4 updates/s through context would re-render every provider
// consumer. usePlayerTime subscribes per component, so only the progress bar,
// subtitle overlay, markers and plugin bridges tick; the chrome stays still.
// ---------------------------------------------------------------------------

interface PlayerTimeValue {
	currentTime: number;
	finishTime: string;
}

const [PlayerTimeStoreContext, usePlayerTimeStore] = createContextHook<PlayerTimeStore>("PlayerTimeStore");

export function usePlayerTime(): PlayerTimeValue {
	const store = usePlayerTimeStore();

	return useSyncExternalStore(store.subscribe, store.getSnapshot);
}

// ---------------------------------------------------------------------------
// Status: playback readiness, buffering, volume, rate.
// ---------------------------------------------------------------------------

interface PlayerStatusValue {
	canPlay: boolean;
	isBuffering: boolean;
	playerError: boolean;
	isChangingQuality: boolean;
	isPaused: boolean;
}

// ---------------------------------------------------------------------------
// Volume: own context so the equalizer, settings menu and footer react to
// volume/mute/rate changes without re-rendering on buffering, errors or any
// other controller state (and vice versa). The provider owns the state.
// ---------------------------------------------------------------------------

interface PlayerVolumeValue {
	volume: number;
	isMuted: boolean;
	playbackRate: number;
}

const [PlayerVolumeContext, usePlayerVolumeRaw] = createContextHook<PlayerVolumeValue>("usePlayerVolume");

export { usePlayerVolumeRaw as usePlayerVolume };

const [PlayerStatusContext, usePlayerStatusRaw] = createContextHook<PlayerStatusValue>("usePlayerStatus");

export { usePlayerStatusRaw as usePlayerStatus };

// ---------------------------------------------------------------------------
// Progress ranges: transcoded (server poll) + buffered (video "progress" events).
// ---------------------------------------------------------------------------

interface PlayerProgressRangesValue {
	/** What the server has transcoded/remuxed so far — can span hours. */
	transcodedRanges: BufferedRange[];
	/** What hls.js actually appended to video.buffered — ~30-60 s ahead of the playhead. */
	bufferedRanges: BufferedRange[];
}

const [PlayerProgressRangesContext, usePlayerProgressRangesRaw] = createContextHook<PlayerProgressRangesValue>("usePlayerProgressRanges");

export { usePlayerProgressRangesRaw as usePlayerProgressRanges };

// ---------------------------------------------------------------------------
// Actions: refs and callbacks used to drive the underlying <video>.
// ---------------------------------------------------------------------------

export interface PlayerActionsValue {
	videoRef: RefObject<HTMLVideoElement | null>;
	hlsRef: RefObject<Hls | null>;
	seek: (position: number) => Promise<void>;
	restorePlaybackPosition: () => void;
	isPlaybackHeld: () => boolean;
	syncPlaybackProgress: (force?: boolean) => Promise<void>;
	onMediaEnd: () => void;
	updatePlaybackTime: (videoCurrentTime: number) => void;
	getAbsoluteTime: (videoCurrentTime: number) => number;
	refreshBufferedRanges: () => void;
	setCanPlay: (canPlay: boolean) => void;
	setIsBuffering: (isBuffering: boolean) => void;
	setIsPaused: (isPaused: boolean) => void;
	setPlayerError: (playerError: boolean) => void;
	setVolume: (volume: number) => void;
	setMuted: (muted: boolean) => void;
	setPlaybackRate: (rate: number) => void;
	reconnectAfterSessionExpiry: () => Promise<void>;
	handleSessionTerminated: (reason?: string) => void;
}

const [PlayerActionsContext, usePlayerActionsRaw] = createContextHook<PlayerActionsValue>("usePlayerActions");

export { usePlayerActionsRaw as usePlayerActions };

// ---------------------------------------------------------------------------
// Subtitles: selection, search and download — owned by the subtitle menu.
// ---------------------------------------------------------------------------

interface PlayerSubtitlesValue {
	subtitles: SubtitleOption[];
	selectedSubtitleId: string | undefined;
	setSelectedSubtitleId: (subtitleId: string | undefined) => void;
	selectedSubtitle: SubtitleOption | undefined;
	subtitleFormat: CaptionFormat | undefined;
	subtitleContent: string | undefined;
	subtitleLanguage: string;
	setSubtitleLanguage: (language: string) => void;
	subtitleCandidates: SubtitleCandidate[] | undefined;
	downloadingCandidateId: string | null;
	isSearchingSubtitles: boolean;
	isSearchError: boolean;
	isDownloadingSubtitle: boolean;
	isDownloadError: boolean;
	searchSubtitles: () => void;
	downloadSubtitle: (providerId: string, subtitleId: string) => void;
	subtitleSize: SubtitleSize;
	subtitlePosition: SubtitlePosition;
	subtitleColor: SubtitleColor;
	subtitleBackground: SubtitleBackground;
	updateSubtitlePreferences: (prefs: Partial<SubtitlePreferences>) => Promise<void>;
	subtitleOffset: number;
	setSubtitleOffset: (offset: number) => void;
	adjustSubtitleOffset: (delta: number) => void;
}

const [PlayerSubtitlesContext, usePlayerSubtitlesRaw] = createContextHook<PlayerSubtitlesValue>("usePlayerSubtitles");

export { usePlayerSubtitlesRaw as usePlayerSubtitles };

// ---------------------------------------------------------------------------
// Diagnostics: merged toggle + data.
// ---------------------------------------------------------------------------

interface PlayerDiagnosticsValue {
	isOpen: boolean;
	toggle: () => void;
	close: () => void;
	diagnostics: PlaybackDiagnostics | undefined;
	isPending: boolean;
	isError: boolean;
	session: PlayerSession;
	clientMetrics?: {
		videoWidth: number;
		videoHeight: number;
		totalFrames: number;
		droppedFrames: number;
		corruptedFrames: number;
		bandwidthEstimate?: number;
		bufferedSeconds: number;
	} | null;
}

const [PlayerDiagnosticsContext, usePlayerDiagnosticsRaw] = createContextHook<PlayerDiagnosticsValue>("usePlayerDiagnostics");

export { usePlayerDiagnosticsRaw as usePlayerDiagnostics };

export function usePlayerDiagnosticsToggle() {
	const value = usePlayerDiagnosticsRaw();

	return { isOpen: value.isOpen, toggle: value.toggle, close: value.close };
}

export function usePlayerDiagnosticsData() {
	const value = usePlayerDiagnosticsRaw();

	return {
		diagnostics: value.diagnostics,
		isPending: value.isPending,
		isError: value.isError,
		session: value.session,
		clientMetrics: value.clientMetrics,
	};
}

// ---------------------------------------------------------------------------
// Info: identity of what's playing. Changes only on media-file navigation.
// ---------------------------------------------------------------------------

interface PlayerInfoValue {
	mediaFileId: string;
	metadataId: string;
	episodeId?: string | null;
	sessionId: string;
	title: string;
	duration: number;
	playbackConfigKey: string;
	playlistRevision: number;
	mode: PlayerSession["mode"];
}

const [PlayerInfoContext, usePlayerInfoRaw] = createContextHook<PlayerInfoValue>("usePlayerInfo");

export { usePlayerInfoRaw as usePlayerInfo };

// ---------------------------------------------------------------------------
// Settings: audio/quality settings.
// ---------------------------------------------------------------------------

interface PlayerSettingsValue extends PlaybackSettings, PlaybackSettingsActions {
	audioStreams: AudioStream[];
	selectedAudioStream: AudioStream | undefined;
}

const [PlayerSettingsContext, usePlayerSettingsRaw] = createContextHook<PlayerSettingsValue>("usePlayerSettings");

export { usePlayerSettingsRaw as usePlayerSettings };

// ---------------------------------------------------------------------------
// Next Episode
// ---------------------------------------------------------------------------

interface PlayerNextEpisodeValue {
	currentEpisode: CurrentEpisodeInfo | null;
	nextEpisode: NextEpisodeInfo | null;
	isNextEpisodeLoading: boolean;
	playNextEpisode: () => void;
	isNextEpisodeDismissed: boolean;
	setIsNextEpisodeDismissed: (dismissed: boolean) => void;
	autoplay: boolean;
}

const [PlayerNextEpisodeContext, usePlayerNextEpisodeRaw] = createContextHook<PlayerNextEpisodeValue>("usePlayerNextEpisode");

export { usePlayerNextEpisodeRaw as usePlayerNextEpisode };

// ---------------------------------------------------------------------------
// Markers
// ---------------------------------------------------------------------------

interface PlayerMarkersValue {
	markers: MediaMarker[];
	activeMarker: MediaMarker | null;
	skipActiveMarker: () => void;
}

const [PlayerMarkersContext, usePlayerMarkersRaw] = createContextHook<PlayerMarkersValue>("usePlayerMarkers");

export { usePlayerMarkersRaw as usePlayerMarkers };

// ---------------------------------------------------------------------------
// Episodes: seasons + playback progress — used by episodes drawer.
// ---------------------------------------------------------------------------

interface PlayerEpisodesValue {
	seasons: Array<{ id: string; seasonNumber: number }>;
	playback:
		| {
				totalEpisodes?: number;
				completedEpisodes?: number;
				episodes?: Record<
					string,
					{
						status?: string;
						progress?: { position?: number; duration?: number } | null;
					}
				>;
		  }
		| undefined;
}

const [PlayerEpisodesContext, usePlayerEpisodesRaw] = createContextHook<PlayerEpisodesValue>("usePlayerEpisodes");

export { usePlayerEpisodesRaw as usePlayerEpisodes };

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function PlayerProvider({
	mediaFileId,
	mediaFile,
	session,
	onSessionExpired,
	settings,
	settingsActions,
	isChangingQuality,
	title,
	profileId,
	profilePreferences,
	children,
}: {
	mediaFileId: string;
	mediaFile: PlayerMediaFile;
	session: PlayerSession;
	onSessionExpired: () => Promise<void>;
	settings: PlaybackSettings;
	settingsActions: PlaybackSettingsActions;
	isChangingQuality: boolean;
	title: string;
	profileId: string | undefined;
	profilePreferences:
		| {
				autoplay?: boolean;
				autoSkipIntro?: boolean;
				autoSkipCredits?: boolean;
				autoSkipRecap?: boolean;
				subtitleSize?: SubtitleSize;
				subtitlePosition?: SubtitlePosition;
				subtitleColor?: SubtitleColor;
				subtitleBackground?: SubtitleBackground;
				subtitleLanguage?: string | null;
		  }
		| undefined;
	children: ReactNode;
}) {
	const playbackConfigKey = `${session.sessionId}:${session.operationId}`;
	// One store per mounted player — lives for the whole PlayerProvider lifetime
	// (PlayerPage remounts it on media-file navigation).
	const [timeStore] = useState(() => createPlayerTimeStore(mediaFile.duration ?? 0));
	// The <video> ref and the volume slice are owned HERE, not by the controller:
	// the provider publishes them through PlayerVolumeContext, whose memoized
	// value only changes when volume/mute/rate actually change.
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const volumeState: PlayerVolumeState = usePlayerVolumeState(videoRef);
	const controller = usePlayerController({
		mediaFileId,
		mediaFile,
		session,
		sessionId: session.sessionId,
		playbackConfigKey,
		onSessionExpired,
		settings,
		profileId,
		profilePreferences,
		timeStore,
		videoRef,
		volumeState,
	});

	const audioStreams = useMemo(() => mediaFile.audioStreams.toSorted((left, right) => left.index - right.index), [mediaFile.audioStreams]);

	const { volume, isMuted, playbackRate } = volumeState;
	const volumeValue: PlayerVolumeValue = useMemo(() => ({ volume, isMuted, playbackRate }), [volume, isMuted, playbackRate]);
	const statusValue: PlayerStatusValue = useMemo(
		() => ({ ...controller.status, isChangingQuality }),
		[controller.status, isChangingQuality],
	);

	const progressRangesValue: PlayerProgressRangesValue = useMemo(
		() => ({ transcodedRanges: controller.transcodedRanges, bufferedRanges: controller.bufferedRanges }),
		[controller.transcodedRanges, controller.bufferedRanges],
	);

	const diagnosticsValue: PlayerDiagnosticsValue = useMemo(
		() => ({ ...controller.diagnosticsToggle, ...controller.diagnosticsData, session }),
		[controller.diagnosticsData, controller.diagnosticsToggle, session],
	);

	const infoValue: PlayerInfoValue = useMemo(
		() => ({
			mediaFileId,
			metadataId: mediaFile.metadataId,
			episodeId: mediaFile.episodeId ?? null,
			sessionId: session.sessionId,
			title,
			duration: mediaFile.duration ?? 0,
			playbackConfigKey,
			playlistRevision: controller.playlistRevision,
			mode: session.mode,
		}),
		[
			mediaFileId,
			mediaFile.metadataId,
			mediaFile.episodeId,
			session.sessionId,
			session.mode,
			title,
			mediaFile.duration,
			playbackConfigKey,
			controller.playlistRevision,
		],
	);

	const settingsValue: PlayerSettingsValue = useMemo(() => {
		const activeAudioStreamIndex = settings.audioStreamIndex ?? session.audioStreamIndex ?? audioStreams[0]?.index;
		const selectedAudioStream = audioStreams.find((stream) => stream.index === activeAudioStreamIndex) ?? audioStreams[0];

		return {
			maxBitrate: settings.maxBitrate,
			audioStreamIndex: settings.audioStreamIndex,
			onQualityChange: settingsActions.onQualityChange,
			onAudioStreamChange: settingsActions.onAudioStreamChange,
			audioStreams,
			selectedAudioStream,
		};
	}, [
		audioStreams,
		session.audioStreamIndex,
		settings.audioStreamIndex,
		settings.maxBitrate,
		settingsActions.onAudioStreamChange,
		settingsActions.onQualityChange,
	]);

	const episodesValue: PlayerEpisodesValue = useMemo(
		() => ({ seasons: controller.seasons, playback: controller.playback }),
		[controller.playback, controller.seasons],
	);

	return (
		<PlayerInfoContext.Provider value={infoValue}>
			<PlayerSettingsContext.Provider value={settingsValue}>
				<PlayerActionsContext.Provider value={controller.actions}>
					<PlayerStatusContext.Provider value={statusValue}>
						<PlayerVolumeContext.Provider value={volumeValue}>
							<PlayerProgressRangesContext.Provider value={progressRangesValue}>
								<PlayerTimeStoreContext.Provider value={timeStore}>
									<PlayerSubtitlesContext.Provider value={controller.subtitles}>
										<PlayerNextEpisodeContext.Provider value={controller.nextEpisode}>
											<PlayerMarkersContext.Provider value={controller.markers}>
												<PlayerEpisodesContext.Provider value={episodesValue}>
													<PlayerDiagnosticsContext.Provider value={diagnosticsValue}>{children}</PlayerDiagnosticsContext.Provider>
												</PlayerEpisodesContext.Provider>
											</PlayerMarkersContext.Provider>
										</PlayerNextEpisodeContext.Provider>
									</PlayerSubtitlesContext.Provider>
								</PlayerTimeStoreContext.Provider>
							</PlayerProgressRangesContext.Provider>
						</PlayerVolumeContext.Provider>
					</PlayerStatusContext.Provider>
				</PlayerActionsContext.Provider>
			</PlayerSettingsContext.Provider>
		</PlayerInfoContext.Provider>
	);
}
