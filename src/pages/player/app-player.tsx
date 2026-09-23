import { cn } from "cn";
import type Hls from "hls.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { reelvault } from "@/client/client";
import { useMetadata } from "@/client/hooks/use-metadata-queries";
import { getPlaybackPlaylistUrl } from "@/client/hooks/use-playback-session";
import { AppErrorState, AppLoadingState } from "@/components/app-states";
import { PortalContainerProvider } from "@/components/portal-container";
import { setNativeKeepAwake, setNativeLandscapeLock } from "@/lib/capacitor-native";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { PlayerChrome } from "./components/player-chrome";
import { toPlaybackError } from "./hooks/use-player-controller.hook";
import { usePlayerShortcuts } from "./hooks/use-player-shortcuts";
import { usePlayerTouchGestures } from "./hooks/use-player-touch-gestures";
import {
	PlayerProvider,
	usePlayerActions,
	usePlayerDiagnosticsToggle,
	usePlayerInfo,
	usePlayerNextEpisode,
	usePlayerSettings,
	usePlayerStatus,
	usePlayerSubtitles,
	usePlayerVolume,
} from "./player-context";
import type { PlaybackSettings, PlaybackSettingsActions, PlayerMediaFile, PlayerSession } from "./utils/player.types";
import { detach, noopCleanup, toggleFullscreen, togglePlayPause } from "./utils/player-utils";
import { getShortcutsDisabledCookie, setShortcutsDisabledCookie } from "./utils/shortcuts-cookie";

export function AppPlayer({
	mediaFileId,
	mediaFile,
	session,
	onSessionExpired,
	settings,
	settingsActions,
	isChangingQuality,
	profileId,
	profilePreferences,
}: {
	mediaFileId: string;
	mediaFile: PlayerMediaFile;
	session: PlayerSession;
	onSessionExpired: () => Promise<void>;
	settings: PlaybackSettings;
	settingsActions: PlaybackSettingsActions;
	isChangingQuality: boolean;
	profileId: string | undefined;
	profilePreferences:
		| {
				autoplay?: boolean;
				autoSkipIntro?: boolean;
				autoSkipCredits?: boolean;
				autoSkipRecap?: boolean;
				subtitleSize?: "small" | "normal" | "large" | "extra-large";
				subtitlePosition?: "bottom" | "top" | "middle";
				subtitleColor?: "white" | "yellow" | "cyan" | "green";
				subtitleBackground?: "none" | "semi" | "solid";
				subtitleLanguage?: string | null;
		  }
		| undefined;
}) {
	const metadataQuery = useMetadata(mediaFile.metadataId);

	if (metadataQuery.isPending) return <AppLoadingState label={m.player_loading_media()} className="min-h-screen bg-background" />;

	if (metadataQuery.isError) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background px-6">
				<AppErrorState title={m.player_info_fetch_failed()} error={metadataQuery.error} />
			</div>
		);
	}

	return (
		<PlayerProvider
			mediaFileId={mediaFileId}
			mediaFile={mediaFile}
			session={session}
			onSessionExpired={onSessionExpired}
			settings={settings}
			settingsActions={settingsActions}
			isChangingQuality={isChangingQuality}
			title={metadataQuery.data.title}
			profileId={profileId}
			profilePreferences={profilePreferences}
		>
			<AppPlayerSurface />
		</PlayerProvider>
	);
}

// ---------------------------------------------------------------------------
// AppPlayerSurface — mounts the native <video>, initialises hls.js, wires
// all DOM events to the controller, and renders the UI chrome on top.
// ---------------------------------------------------------------------------

function AppPlayerSurface() {
	const info = usePlayerInfo();
	const actions = usePlayerActions();
	const subtitles = usePlayerSubtitles();
	const nextEpisode = usePlayerNextEpisode();
	const status = usePlayerStatus();
	const volumeState = usePlayerVolume();
	const diagnosticsToggle = usePlayerDiagnosticsToggle();

	const [shortcutsOpen, setShortcutsOpen] = useState(false);
	const [controlsVisible, setControlsVisible] = useState(false);
	const [shortcutsDisabled, setShortcutsDisabled] = useState(getShortcutsDisabledCookie);
	const [hlsModule, setHlsModule] = useState<{ cls: typeof Hls } | null>(null);

	useEffect(() => {
		let cancelled = false;
		detach(async () => {
			try {
				const mod = await import("hls.js");
				if (!cancelled) setHlsModule({ cls: mod.default });
			} catch (error: unknown) {
				console.error(error);
			}
		});

		return () => {
			cancelled = true;
		};
	}, []);

	const handleToggleShortcutsDisabled = (disabled: boolean) => {
		setShortcutsDisabled(disabled);
		setShortcutsDisabledCookie(disabled);
	};

	const playerSettings = usePlayerSettings();

	const actionsRef = useRef(actions);
	const infoRef = useRef(info);
	const playerSettingsRef = useRef(playerSettings);
	const statusRef = useRef({ ...status, ...volumeState });
	useEffect(() => {
		actionsRef.current = actions;
		infoRef.current = info;
		playerSettingsRef.current = playerSettings;
		statusRef.current = { ...status, ...volumeState };
	});

	const containerRef = useRef<HTMLDivElement>(null);
	// Commit-phase callback ref: the shared <video> ref lives in the provider
	// (via context), and reading it during render is not allowed — so the node
	// is written through the stable actionsRef instead.
	const setVideoNode = useCallback((node: HTMLVideoElement | null) => {
		actionsRef.current.videoRef.current = node;
	}, []);
	// Portal target for Base UI, via state instead of a render-phase ref read —
	// reading containerRef.current during render defeats compiler memoization
	// for this whole subtree. One extra render after mount, then stable.
	const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
	const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		setPortalContainer(containerRef.current);
	}, []);

	const playlistUrl = getPlaybackPlaylistUrl(info.sessionId, `${info.playbackConfigKey}:${info.playlistRevision}`);

	// -------------------------------------------------------------------------
	// Subtitle blob URL management
	// -------------------------------------------------------------------------

	useEffect(() => {
		const video = actionsRef.current.videoRef.current;
		if (!video) return;

		const existingTracks = video.querySelectorAll("track");
		for (const t of existingTracks) t.remove();
	}, []);

	// -------------------------------------------------------------------------
	// HLS.js initialisation and cleanup
	// -------------------------------------------------------------------------

	const mediaRecoveryAttemptsRef = useRef(0);
	const nativeRecoveryAttemptsRef = useRef(0);
	const autoDegradeUsedRef = useRef(false);
	const lastMissingProbeAtRef = useRef(0);
	const hasStartedInitialPlayRef = useRef(false);
	const wasPlayingBeforeReloadRef = useRef(false);

	useEffect(() => {
		const video = actionsRef.current.videoRef.current;
		if (!(video && hlsModule)) return noopCleanup;

		const HlsClass = hlsModule.cls;
		let hls = actionsRef.current.hlsRef.current;
		const { hlsRef } = actionsRef.current;

		const onManifestParsed = () => {
			// Manifest ready
		};

		const onError = (
			_event: unknown,
			data: { fatal?: boolean; details?: string; response?: { code?: number }; type?: string; context?: { url?: string } },
			// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: hls.js recovery ladder (fatal vs stall vs bandwidth degradation) must run in order; splitting reshuffles recovery priority
		) => {
			if (!data.fatal) {
				// "Auto" quality + a stall caused by low bandwidth — degrade once instead
				// of stuttering until the user finds the quality menu themselves.
				if (data.details !== HlsClass.ErrorDetails.BUFFER_STALLED_ERROR || autoDegradeUsedRef.current) return;

				if (playerSettingsRef.current.maxBitrate) return;

				autoDegradeUsedRef.current = true;

				const estimateKbps = Math.round((hls?.bandwidthEstimate ?? 0) / 1000);
				if (estimateKbps <= 0 || estimateKbps >= 4800) return;

				const target = estimateKbps >= 2500 ? 2500 : 1200;
				playerSettingsRef.current.onQualityChange(target);

				toast.info(
					m.player_slow_connection_quality({ target: target === 2500 ? m.player_quality_hd() : m.player_quality_saver_genitive() }),
				);

				return;
			}

			if (data.response?.code === 403) {
				actionsRef.current.handleSessionTerminated();

				return;
			}

			if (data.type === HlsClass.ErrorTypes.NETWORK_ERROR) {
				if (!data.context?.url || data.context.url.includes(info.sessionId)) {
					detach(() => actionsRef.current.reconnectAfterSessionExpiry());
				}
			} else if (data.type === HlsClass.ErrorTypes.MEDIA_ERROR) {
				// Bound recovery — repeated decode errors mean the session itself is bad;
				// a fresh session is the actual fix. Progressing playback resets the counter.
				if (mediaRecoveryAttemptsRef.current < 2) {
					mediaRecoveryAttemptsRef.current += 1;
					hls?.recoverMediaError();
				} else {
					detach(() => actionsRef.current.reconnectAfterSessionExpiry());
				}
			} else {
				actionsRef.current.setPlayerError(true);
			}
		};

		if (HlsClass.isSupported()) {
			if (!hls) {
				hls = new HlsClass({
					enableWorker: true,
					lowLatencyMode: false,
					// EVENT playlists (our growing transcode manifests, no ENDLIST until the
					// file ends) classify as `live` in hls.js. With the default startPosition
					// (-1 = auto), hls.js begins at the live edge — the fast encoder already
					// wrote many segments before the first manifest load, so playback started
					// "randomly" tens of seconds to minutes in. Pin the start to the playlist
					// beginning: local 0 is the session/seek-generation start.
					startPosition: 0,
					// Defaults buffer only ~30 s ahead (invisible on a long progress bar)
					// and keep everything behind the playhead forever. Buffer deeper for
					// stall resilience + a visible buffer layer; trim old segments.
					maxBufferLength: 90,
					maxBufferSize: 150_000_000,
					backBufferLength: 60,
					initialLiveManifestSize: 2,
					// Pass cookies for authenticated endpoints
					xhrSetup: (xhr, url) => {
						xhr.withCredentials = true;
						xhr.onloadend = () => {
							if (xhr.status === 403) {
								actionsRef.current.handleSessionTerminated();

								return;
							}

							if ((xhr.status === 404 || xhr.status === 410) && typeof url === "string" && url.includes(info.sessionId)) {
								// A 404 also lands here while the server restarts its stream inside a
								// live session (seek beyond the transcoded range). Probe the session
								// first: reconnect only when the server confirms it is gone.
								const now = Date.now();
								if (now - lastMissingProbeAtRef.current < 1_000) return;

								lastMissingProbeAtRef.current = now;
								detach(async () => {
									try {
										await reelvault.playbackSessions.keepAlive(info.sessionId);
									} catch (error: unknown) {
										const probeError = toPlaybackError(error);
										if (probeError.status === 403) actionsRef.current.handleSessionTerminated();
										else detach(() => actionsRef.current.reconnectAfterSessionExpiry());
									}
								});
							}
						};
					},
				});

				hls.on(HlsClass.Events.MANIFEST_PARSED, onManifestParsed);
				hls.on(HlsClass.Events.ERROR, onError);

				actionsRef.current.hlsRef.current = hls;
				hls.attachMedia(video);
			}

			hls.stopLoad();
			hls.loadSource(playlistUrl);
		} else if (video.canPlayType("application/vnd.apple.mpegurl")) {
			// Native HLS (Safari)
			video.src = playlistUrl;
		} else {
			actionsRef.current.setPlayerError(true);
		}

		return () => {
			// Capture intent before pause(): if the user had paused, the reload that
			// follows (seek/quality change/session reconnect) must NOT auto-resume.
			wasPlayingBeforeReloadRef.current = !video.paused;
			video.pause();
			video.removeAttribute("src");
			video.load();
			if (hls) {
				hls.off(HlsClass.Events.MANIFEST_PARSED, onManifestParsed);
				hls.off(HlsClass.Events.ERROR, onError);
				hls.destroy();
				hlsRef.current = null;
			}
		};
	}, [playlistUrl, info.sessionId, hlsModule]);

	// One bandwidth-triggered quality drop per session — reconnects start fresh.
	const lastAutoDegradeSessionRef = useRef<string | null>(null);
	useEffect(() => {
		if (lastAutoDegradeSessionRef.current === info.sessionId) return;

		lastAutoDegradeSessionRef.current = info.sessionId;
		autoDegradeUsedRef.current = false;
	}, [info.sessionId]);

	// -------------------------------------------------------------------------
	// Native <video> DOM event wiring
	// -------------------------------------------------------------------------

	useEffect(() => {
		const video = actionsRef.current.videoRef.current;
		if (!video) return noopCleanup;

		const onCanPlay = () => {
			actionsRef.current.restorePlaybackPosition();
			// Saved position still pending — keep the loading overlay up and let the
			// controller's initial resume seek place us at the right spot first,
			// instead of visibly starting from 0 and jumping forward a second later.
			if (actionsRef.current.isPlaybackHeld()) {
				actionsRef.current.setCanPlay(true);

				return;
			}

			// Auto-play only on first start, after a reload that interrupted active
			// playback, or when already playing. A user pause must stick across
			// playlist reloads (seek, quality change, session reconnect).
			const shouldAutoPlay = !hasStartedInitialPlayRef.current || wasPlayingBeforeReloadRef.current || !video.paused;
			if (shouldAutoPlay) {
				hasStartedInitialPlayRef.current = true;
				detach(async () => {
					try {
						await video.play();
					} catch (err: unknown) {
						console.warn("Autoplay was blocked or deferred:", err);
						actionsRef.current.setIsPaused(true);
					}
				});
				actionsRef.current.setIsBuffering(false);
			} else {
				actionsRef.current.setIsBuffering(false);
			}

			actionsRef.current.setCanPlay(true);
			actionsRef.current.setPlayerError(false);
		};

		const onPlaying = () => {
			actionsRef.current.setIsBuffering(false);
			actionsRef.current.setIsPaused(false);
			detach(() => setNativeKeepAwake(true));
		};

		const onWaiting = () => actionsRef.current.setIsBuffering(true);
		const onStalled = () => actionsRef.current.setIsBuffering(true);
		const onPause = () => {
			actionsRef.current.setIsPaused(true);
			detach(() => setNativeKeepAwake(false));
			detach(() => actionsRef.current.syncPlaybackProgress(true));
		};
		const onPlay = () => actionsRef.current.setIsPaused(false);
		const onSeeked = () => {
			detach(() => actionsRef.current.syncPlaybackProgress(true));
		};

		const onTimeUpdate = () => {
			mediaRecoveryAttemptsRef.current = 0;
			nativeRecoveryAttemptsRef.current = 0;
			actionsRef.current.updatePlaybackTime(video.currentTime);
			actionsRef.current.refreshBufferedRanges();
		};

		// "progress" fires as the browser downloads more data — ideal for buffer bar
		const onProgress = () => actionsRef.current.refreshBufferedRanges();

		const onError = () => {
			// Native HLS (Safari) has no hls.js recovery layer — retry the playlist
			// source a bounded number of times, preserving position and play intent;
			// a persistently bad session escalates like a fatal hls.js error.
			if (actionsRef.current.hlsRef.current) {
				actionsRef.current.setPlayerError(true);

				return;
			}

			if (nativeRecoveryAttemptsRef.current < 2) {
				nativeRecoveryAttemptsRef.current += 1;
				// Re-fetch the same playlist source. The controller's existing reload
				// machinery does the rest: onCanPlay → restorePlaybackPosition()
				// seeks back to the tracked playhead, and the wasPlaying flag auto-
				// resumes only if the error interrupted active playback.
				wasPlayingBeforeReloadRef.current = !video.paused;
				video.load();

				return;
			}

			detach(() => actionsRef.current.reconnectAfterSessionExpiry());
		};
		const onEnded = () => actionsRef.current.onMediaEnd();

		const onVolumeChange = () => {
			if (video.volume === 1 && statusRef.current.volume > 1) {
				// Native video.volume is pegged at 1.0 while volume is boosted (> 100%),
				// so avoid clobbering the boosted state.
			} else {
				actionsRef.current.setVolume(video.volume);
			}

			actionsRef.current.setMuted(video.muted);
		};

		const onRateChange = () => actionsRef.current.setPlaybackRate(video.playbackRate);

		video.addEventListener("canplay", onCanPlay);
		video.addEventListener("playing", onPlaying);
		video.addEventListener("waiting", onWaiting);
		video.addEventListener("stalled", onStalled);
		video.addEventListener("pause", onPause);
		video.addEventListener("play", onPlay);
		video.addEventListener("seeked", onSeeked);
		video.addEventListener("timeupdate", onTimeUpdate);
		video.addEventListener("progress", onProgress);
		video.addEventListener("error", onError);
		video.addEventListener("ended", onEnded);
		video.addEventListener("volumechange", onVolumeChange);
		video.addEventListener("ratechange", onRateChange);

		return () => {
			video.removeEventListener("canplay", onCanPlay);
			video.removeEventListener("playing", onPlaying);
			video.removeEventListener("waiting", onWaiting);
			video.removeEventListener("stalled", onStalled);
			video.removeEventListener("pause", onPause);
			video.removeEventListener("play", onPlay);
			video.removeEventListener("seeked", onSeeked);
			video.removeEventListener("timeupdate", onTimeUpdate);
			video.removeEventListener("progress", onProgress);
			video.removeEventListener("error", onError);
			video.removeEventListener("ended", onEnded);
			video.removeEventListener("volumechange", onVolumeChange);
			video.removeEventListener("ratechange", onRateChange);
			detach(() => setNativeKeepAwake(false));
			detach(() => setNativeLandscapeLock(false));
		};
	}, []);

	// -------------------------------------------------------------------------
	// Controls auto-hide on mouse idle
	// -------------------------------------------------------------------------

	const effectiveControlsVisible = controlsVisible || status.isPaused || shortcutsOpen || diagnosticsToggle.isOpen;

	const clearHideTimer = () => {
		if (hideTimerRef.current) {
			clearTimeout(hideTimerRef.current);
			hideTimerRef.current = null;
		}
	};

	const showControls = () => {
		setControlsVisible(true);
		clearHideTimer();
		if (!status.isPaused) {
			hideTimerRef.current = setTimeout(() => setControlsVisible(false), 3000);
		}
	};

	const hideControls = () => {
		if (!(status.isPaused || shortcutsOpen || diagnosticsToggle.isOpen)) {
			clearHideTimer();
			setControlsVisible(false);
		}
	};

	const keepControlsVisible = () => clearHideTimer();

	// Pointer-move fires 100+ times/s; re-arming the hide timer on every event is
	// pure churn. Throttle the timer reset while keeping the first move instant.
	const lastControlsActivityAtRef = useRef(0);
	const handleSurfaceMouseMove = () => {
		const now = Date.now();
		if (now - lastControlsActivityAtRef.current < 200) return;

		lastControlsActivityAtRef.current = now;
		showControls();
	};

	// -------------------------------------------------------------------------
	// Keyboard shortcuts hook
	// -------------------------------------------------------------------------

	usePlayerShortcuts({
		actions,
		containerRef,
		duration: info.duration,
		volume: volumeState.volume,
		isMuted: volumeState.isMuted,
		subtitles: subtitles.subtitles,
		selectedSubtitleId: subtitles.selectedSubtitleId,
		setSelectedSubtitleId: subtitles.setSelectedSubtitleId,
		subtitleOffset: subtitles.subtitleOffset,
		adjustSubtitleOffset: subtitles.adjustSubtitleOffset,
		setSubtitleOffset: subtitles.setSubtitleOffset,
		toggleDiagnostics: diagnosticsToggle.toggle,
		hasNextEpisode: Boolean(nextEpisode.nextEpisode),
		playNextEpisode: nextEpisode.playNextEpisode,
		onOpenShortcuts: () => setShortcutsOpen(true),
		onUserActivity: () => showControls(),
		isDisabled: shortcutsDisabled,
	});

	// -------------------------------------------------------------------------
	// Media Session API — see PlayerMediaSessionBridge below. It subscribes to
	// the playhead directly so this component does not re-render per tick.
	// -------------------------------------------------------------------------

	useEffect(() => {
		return () => {
			if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
		};
	}, []);

	useEffect(() => {
		const forceHide = () => {
			if (hideTimerRef.current) {
				clearTimeout(hideTimerRef.current);
				hideTimerRef.current = null;
			}

			setControlsVisible(false);
		};

		window.addEventListener("blur", forceHide);
		document.addEventListener("visibilitychange", forceHide);

		return () => {
			window.removeEventListener("blur", forceHide);
			document.removeEventListener("visibilitychange", forceHide);
		};
	}, []);

	const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
		};
	}, []);

	const handleTogglePlay = () => {
		const video = actionsRef.current.videoRef.current;
		if (!video) return;

		togglePlayPause(video);
		showControls();
	};

	// Touch: gestures (double-tap seek, long-press 2×, volume swipe) live in
	// usePlayerTouchGestures; a single tap — after the 300 ms decision window —
	// shows/hides the controls. Mouse/keyboard: the existing path with a 200-ms
	// click/double-click distinction — unchanged.
	const lastTouchTsRef = useRef(0);

	const touchGestures = usePlayerTouchGestures({
		onSingleTap: () => {
			if (effectiveControlsVisible) {
				hideControls();
			} else {
				showControls();
			}
		},
	});

	const handleSurfacePointerUp = (event: React.PointerEvent) => {
		if (event.pointerType !== "touch") return;

		lastTouchTsRef.current = performance.now();
		touchGestures.onPointerUp(event);
	};

	const handleSurfaceClick = () => {
		// The touch tap was already handled in pointerUp — the click derives from it.
		if (performance.now() - lastTouchTsRef.current < 500) return;

		if (clickTimerRef.current) {
			clearTimeout(clickTimerRef.current);
			clickTimerRef.current = null;

			return;
		}

		clickTimerRef.current = setTimeout(() => {
			clickTimerRef.current = null;
			handleTogglePlay();
		}, 200);
	};

	const handleSurfaceDoubleClick = () => {
		if (clickTimerRef.current) {
			clearTimeout(clickTimerRef.current);
			clickTimerRef.current = null;
		}

		const container = containerRef.current;
		if (container) toggleFullscreen(container, actionsRef.current.videoRef.current);
	};

	return (
		<PortalContainerProvider container={portalContainer}>
			{/* biome-ignore lint/a11y/noStaticElementInteractions: this is the video player container — mouse events are intentional for controls show/hide */}
			<div
				ref={containerRef}
				className={cn(
					"group/player relative h-screen w-full select-none overflow-hidden bg-background",
					!effectiveControlsVisible && "cursor-none",
				)}
				onMouseMove={handleSurfaceMouseMove}
				onMouseLeave={hideControls}
			>
				{/* Native video element */}
				<video
					ref={setVideoNode}
					className="absolute inset-0 size-full"
					playsInline
					crossOrigin="anonymous"
					onClick={handleSurfaceClick}
					onDoubleClick={handleSurfaceDoubleClick}
					onPointerDown={touchGestures.onPointerDown}
					onPointerMove={touchGestures.onPointerMove}
					onPointerUp={handleSurfacePointerUp}
					onPointerCancel={touchGestures.onPointerCancel}
				>
					<track kind="captions" />
				</video>

				<PlayerChrome
					diagnosticsOpen={diagnosticsToggle.isOpen}
					controlsVisible={effectiveControlsVisible}
					surface={{
						onClick: handleSurfaceClick,
						onDoubleClick: handleSurfaceDoubleClick,
						onPointerUp: handleSurfacePointerUp,
					}}
					touchGestures={touchGestures}
					keepControlsVisible={keepControlsVisible}
					shortcutsOpen={shortcutsOpen}
					onShortcutsOpenChange={setShortcutsOpen}
					shortcutsDisabled={shortcutsDisabled}
					onShortcutsDisabledChange={handleToggleShortcutsDisabled}
				/>
			</div>
		</PortalContainerProvider>
	);
}
