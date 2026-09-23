import { useEffect, useRef } from "react";
import { m } from "@/paraglide/messages";
import { showPlayerFeedback } from "../components/player-feedback-hud";
import type { PlayerActionsValue } from "../player-context";
import { isBitmapSubtitle } from "../utils/player.types";
import { MAX_PLAYER_VOLUME } from "../utils/player-audio-boost";
import { detach, toggleFullscreen, togglePiP, togglePlayPause } from "../utils/player-utils";

interface UsePlayerShortcutsProps {
	/** Controller actions (video ref + playback commands) — read through stateRef, never during render. */
	actions: PlayerActionsValue;
	containerRef: React.RefObject<HTMLDivElement | null>;
	duration: number;
	volume: number;
	isMuted: boolean;
	subtitles: Array<{ id: string; format?: string; label?: string | null; language: string }>;
	selectedSubtitleId: string | undefined;
	setSelectedSubtitleId: (id: string | undefined) => void;
	subtitleOffset?: number;
	adjustSubtitleOffset?: (delta: number) => void;
	setSubtitleOffset?: (offset: number) => void;
	toggleDiagnostics: () => void;
	hasNextEpisode: boolean;
	playNextEpisode: () => void;
	onOpenShortcuts: () => void;
	onUserActivity?: () => void;
	isDisabled?: boolean;
}

export function usePlayerShortcuts({
	actions,
	containerRef,
	duration,
	volume,
	isMuted,
	subtitles,
	selectedSubtitleId,
	setSelectedSubtitleId,
	subtitleOffset = 0,
	adjustSubtitleOffset,
	setSubtitleOffset,
	toggleDiagnostics,
	hasNextEpisode,
	playNextEpisode,
	onOpenShortcuts,
	onUserActivity,
	isDisabled = false,
}: UsePlayerShortcutsProps) {
	const lastSubtitleIdRef = useRef<string | null>(null);

	const stateRef = useRef({
		duration,
		volume,
		isMuted,
		subtitles,
		selectedSubtitleId,
		setSelectedSubtitleId,
		subtitleOffset,
		adjustSubtitleOffset,
		setSubtitleOffset,
		actions,
		toggleDiagnostics,
		hasNextEpisode,
		playNextEpisode,
		onOpenShortcuts,
		onUserActivity,
		isDisabled,
	});

	useEffect(() => {
		stateRef.current = {
			duration,
			volume,
			isMuted,
			subtitles,
			selectedSubtitleId,
			setSelectedSubtitleId,
			subtitleOffset,
			adjustSubtitleOffset,
			setSubtitleOffset,
			actions,
			toggleDiagnostics,
			hasNextEpisode,
			playNextEpisode,
			onOpenShortcuts,
			onUserActivity,
			isDisabled,
		};
	});

	useEffect(() => {
		// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: one handler dispatches every player keyboard shortcut
		const handleKeyDown = (e: KeyboardEvent) => {
			if (stateRef.current.isDisabled) return;

			// 1. If page is hidden (minimized, tab in background) or window does not have focus, ignore
			if (typeof document !== "undefined" && (document.visibilityState !== "visible" || !document.hasFocus())) {
				return;
			}

			// 2. Ignore modifier key combinations (except Shift for "?") so browser shortcuts (Ctrl+F, Ctrl+P, Alt+Left, Cmd+C) work
			if (e.ctrlKey || e.altKey || e.metaKey) {
				return;
			}

			// 3. Ignore if user is interacting with form inputs, editable elements, or an open modal/dialog/drawer/menu
			const target = e.target;
			if (target instanceof HTMLElement) {
				const tagName = target.tagName;
				if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT" || target.isContentEditable) {
					return;
				}

				// Check if event target is inside an open dialog, drawer, or dropdown
				if (
					target.closest('[role="dialog"]') ||
					target.closest('[role="menu"]') ||
					target.closest('[role="listbox"]') ||
					target.closest("[data-radix-popper-content-wrapper]")
				) {
					return;
				}
			}

			// Also check if any modal or drawer is currently open in the document
			const openModal = document.querySelector('[role="dialog"][data-state="open"]');
			if (openModal) {
				return;
			}

			const { actions: controller } = stateRef.current;
			const video = controller.videoRef.current;
			if (!video) return;

			const {
				duration: mediaDuration,
				volume: currentVol,
				isMuted: currentMuted,
				subtitles: subtitleList,
				selectedSubtitleId: currentSubId,
				setSelectedSubtitleId: setSubId,
				actions: { seek: doSeek, getAbsoluteTime: getAbsTime, setVolume: setVol, setMuted: setMute },
				toggleDiagnostics: toggleDiag,
				hasNextEpisode: canNext,
				playNextEpisode: doPlayNext,
				onOpenShortcuts: openShortcutsDialog,
				onUserActivity: signalActivity,
			} = stateRef.current;

			signalActivity?.();

			switch (e.key) {
				// Play / Pause
				case " ":
				case "k":
				case "K":
					e.preventDefault();
					togglePlayPause(video);
					showPlayerFeedback({ type: video.paused ? "pause" : "play" });
					break;

				// Fullscreen
				case "f":
				case "F": {
					e.preventDefault();
					const wasFullscreen = Boolean(document.fullscreenElement);
					const container = containerRef.current;
					if (container) toggleFullscreen(container);

					showPlayerFeedback({ type: "fullscreen", value: !wasFullscreen });
					break;
				}

				// Mute
				case "m":
				case "M": {
					e.preventDefault();
					const nextMuted = !currentMuted;
					setMute(nextMuted);
					showPlayerFeedback({ type: "volume", value: nextMuted ? 0 : currentVol, label: nextMuted ? "muted" : undefined });
					break;
				}

				// Seek -10s
				case "ArrowLeft":
				case "j":
				case "J": {
					e.preventDefault();
					const currentAbs = getAbsTime(video.currentTime);
					const targetTime = Math.max(0, currentAbs - 10);
					detach(() => doSeek(targetTime));
					showPlayerFeedback({ type: "seek", delta: -10, value: targetTime });
					break;
				}

				// Seek +10s
				case "ArrowRight":
				case "l":
				case "L": {
					e.preventDefault();
					const currentAbs = getAbsTime(video.currentTime);
					const maxDuration = mediaDuration > 0 ? mediaDuration : Number.POSITIVE_INFINITY;
					const targetTime = Math.min(maxDuration, currentAbs + 10);
					detach(() => doSeek(targetTime));
					showPlayerFeedback({ type: "seek", delta: 10, value: targetTime });
					break;
				}

				// Volume Up (+5%)
				case "ArrowUp": {
					e.preventDefault();
					if (currentMuted) setMute(false);

					const newVol = Math.min(MAX_PLAYER_VOLUME, Math.round((currentVol + 0.05) * 100) / 100);
					setVol(newVol);
					showPlayerFeedback({ type: "volume", value: newVol });
					break;
				}

				// Volume Down (-5%)
				case "ArrowDown": {
					e.preventDefault();
					const newVol = Math.max(0, Math.round((currentVol - 0.05) * 100) / 100);
					if (newVol === 0) {
						setMute(true);
						showPlayerFeedback({ type: "volume", value: 0, label: "muted" });
					} else {
						if (currentMuted) setMute(false);

						setVol(newVol);
						showPlayerFeedback({ type: "volume", value: newVol });
					}

					break;
				}

				// Subtitles Toggle
				case "c":
				case "C":
					e.preventDefault();
					if (currentSubId) {
						lastSubtitleIdRef.current = currentSubId;
						setSubId(undefined);
						showPlayerFeedback({ type: "subtitles", label: m.player_subtitles_disabled() });
					} else {
						// Pick first compatible text subtitle (skip bitmap PGS/VobSub formats)
						const validSubtitles = subtitleList.filter((s) => !isBitmapSubtitle(s.format));
						const fallback = validSubtitles.find((s) => s.id === lastSubtitleIdRef.current) ?? validSubtitles[0];
						if (fallback) {
							setSubId(fallback.id);
							showPlayerFeedback({
								type: "subtitles",
								label: m.player_subtitles_label({ label: fallback.label ?? fallback.language.toUpperCase() }),
							});
						} else {
							showPlayerFeedback({ type: "subtitles", label: m.player_no_subtitles_available() });
						}
					}

					break;

				// Subtitles delay -100ms (G) / advance +100ms (H)
				case "g":
				case "G": {
					e.preventDefault();
					const adjust = stateRef.current.adjustSubtitleOffset;
					if (adjust) {
						adjust(-0.1);
						const next = Math.round((stateRef.current.subtitleOffset - 0.1) * 10) / 10;
						showPlayerFeedback({
							type: "subtitles",
							label: m.player_subtitle_offset_label({ offset: next > 0 ? `+${next.toFixed(1)}` : next.toFixed(1) }),
						});
					}

					break;
				}

				case "h":
				case "H": {
					e.preventDefault();
					const adjust = stateRef.current.adjustSubtitleOffset;
					if (adjust) {
						adjust(0.1);
						const next = Math.round((stateRef.current.subtitleOffset + 0.1) * 10) / 10;
						showPlayerFeedback({
							type: "subtitles",
							label: m.player_subtitle_offset_label({ offset: next > 0 ? `+${next.toFixed(1)}` : next.toFixed(1) }),
						});
					}

					break;
				}

				// Next Episode
				case "n":
				case "N":
					e.preventDefault();
					if (canNext) {
						doPlayNext();
					}

					break;

				// Picture-in-Picture
				case "p":
				case "P":
					e.preventDefault();
					togglePiP(video);
					break;

				// Diagnostics Panel
				case "d":
				case "D":
				case "i":
				case "I":
					e.preventDefault();
					toggleDiag();
					break;

				// Shortcuts help dialog
				case "?":
					e.preventDefault();
					openShortcutsDialog();
					break;

				// Percent seeks (0..9)
				case "0":
				case "1":
				case "2":
				case "3":
				case "4":
				case "5":
				case "6":
				case "7":
				case "8":
				case "9":
					if (mediaDuration > 0) {
						e.preventDefault();
						const percent = Number(e.key) * 10;
						const targetTime = (percent / 100) * mediaDuration;
						detach(() => doSeek(targetTime));
						showPlayerFeedback({ type: "seek", delta: percent, value: targetTime });
					}

					break;

				// Home (Seek to start)
				case "Home":
					e.preventDefault();
					detach(() => doSeek(0));
					showPlayerFeedback({ type: "seek", delta: 0, value: 0 });
					break;

				// End (Seek to end)
				case "End":
					if (mediaDuration > 0) {
						e.preventDefault();
						detach(() => doSeek(mediaDuration));
					}

					break;

				default:
					break;
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [containerRef]);
}
