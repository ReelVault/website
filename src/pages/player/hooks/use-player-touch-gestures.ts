import { useCallback, useEffect, useRef } from "react";
import { showPlayerFeedback } from "../components/player-feedback-hud";
import { usePlayerActions } from "../player-context";
import { MAX_PLAYER_VOLUME } from "../utils/player-audio-boost";
import { detach } from "../utils/player-utils";

/**
 * Touch gestures on the playback surface (mobile shells):
 * - double-tap on the left/right third → seek ∓10 s,
 * - long-press (≥500 ms) → temporary 2× speed, restored on release,
 * - vertical swipe starting on the left edge → volume,
 * - single tap (after a 300 ms disambiguation window) → onSingleTap
 *   (controls show/hide, unchanged behaviour).
 *
 * All state lives in refs — a running gesture never re-renders the player; the
 * visible part goes through the external feedback HUD. Mouse/pen input is
 * ignored entirely (handled by the existing click/dblclick paths).
 */
interface UsePlayerTouchGesturesParams {
	onSingleTap: () => void;
}

const DOUBLE_TAP_WINDOW_MS = 300;
const LONG_PRESS_MS = 500;
const MOVE_THRESHOLD_PX = 14;
/** Vertical swipes only start in this fraction of the surface width (left edge). */
const VOLUME_ZONE_FRACTION = 0.28;
/** Full surface height of upward swipe equals this much volume. */
const VOLUME_SWIPE_GAIN = 1.2;
const BOOST_RATE = 2;

type TapSide = "left" | "right" | "middle";

function haptic(durationMs: number) {
	try {
		navigator.vibrate(durationMs);
	} catch {
		// Vibration API is unavailable or blocked — haptics are best-effort.
	}
}

export function usePlayerTouchGestures({ onSingleTap }: UsePlayerTouchGesturesParams) {
	const { videoRef, seek, getAbsoluteTime, setVolume, setMuted, setPlaybackRate } = usePlayerActions();

	const paramsRef = useRef({ onSingleTap });
	useEffect(() => {
		paramsRef.current = { onSingleTap };
	});

	const gestureRef = useRef({
		active: false,
		startX: 0,
		startY: 0,
		startVolume: 0,
		moved: false,
		volumeMode: false,
		boosting: false,
		rateBeforeBoost: 1,
		longPressTimer: null as ReturnType<typeof setTimeout> | null,
		singleTapTimer: null as ReturnType<typeof setTimeout> | null,
		lastTap: { time: 0, side: "middle" },
	});

	const clearLongPressTimer = useCallback(() => {
		const g = gestureRef.current;
		if (g.longPressTimer) {
			clearTimeout(g.longPressTimer);
			g.longPressTimer = null;
		}
	}, []);

	const clearSingleTapTimer = useCallback(() => {
		const g = gestureRef.current;
		if (g.singleTapTimer) {
			clearTimeout(g.singleTapTimer);
			g.singleTapTimer = null;
		}
	}, []);

	const endBoost = useCallback(() => {
		const g = gestureRef.current;
		if (!g.boosting) return;

		g.boosting = false;
		setPlaybackRate(g.rateBeforeBoost);
		showPlayerFeedback({ type: "speed", value: g.rateBeforeBoost });
	}, [setPlaybackRate]);

	const seekRelative = useCallback(
		(deltaSeconds: number) => {
			const video = videoRef.current;
			if (!video) return;

			const maxDuration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : Number.POSITIVE_INFINITY;
			const targetTime = Math.max(0, Math.min(maxDuration, getAbsoluteTime(video.currentTime) + deltaSeconds));
			detach(() => seek(targetTime));
			showPlayerFeedback({ type: "seek", delta: deltaSeconds, value: targetTime });
		},
		[getAbsoluteTime, seek, videoRef],
	);

	const onPointerDown = useCallback(
		(event: React.PointerEvent) => {
			if (event.pointerType !== "touch") return;

			const g = gestureRef.current;

			// A second finger lands — this is a pinch/system gesture, abandon ours.
			if (g.active) {
				clearLongPressTimer();
				endBoost();
				g.volumeMode = false;
				g.moved = true;

				return;
			}

			g.active = true;
			g.startX = event.clientX;
			g.startY = event.clientY;
			g.moved = false;
			g.volumeMode = false;
			g.startVolume = videoRef.current?.volume ?? 1;

			g.longPressTimer = setTimeout(() => {
				g.longPressTimer = null;
				if (!g.active || g.moved || g.volumeMode) return;

				const video = videoRef.current;
				if (!video || video.paused) return;

				g.rateBeforeBoost = video.playbackRate || 1;
				if (g.rateBeforeBoost === BOOST_RATE) return;

				g.boosting = true;
				setPlaybackRate(BOOST_RATE);
				showPlayerFeedback({ type: "speed", value: BOOST_RATE });
				haptic(20);
			}, LONG_PRESS_MS);
		},
		[clearLongPressTimer, endBoost, setPlaybackRate, videoRef],
	);

	const onPointerMove = useCallback(
		(event: React.PointerEvent) => {
			if (event.pointerType !== "touch") return;

			const g = gestureRef.current;
			if (!g.active) return;

			const dx = event.clientX - g.startX;
			const dy = event.clientY - g.startY;

			if (!g.volumeMode) {
				if (Math.abs(dx) <= MOVE_THRESHOLD_PX && Math.abs(dy) <= MOVE_THRESHOLD_PX) return;

				clearLongPressTimer();
				g.moved = true;
				const surface = event.currentTarget;
				const inVolumeZone = g.startX - surface.getBoundingClientRect().left < surface.clientWidth * VOLUME_ZONE_FRACTION;
				if (inVolumeZone && Math.abs(dy) > Math.abs(dx)) {
					g.volumeMode = true;
					haptic(10);
				} else {
					return;
				}
			}

			// Volume swipe: full surface height of drag ≈ VOLUME_SWIPE_GAIN turns of volume.
			const surface = event.currentTarget;
			const deltaVolume = (-dy / Math.max(1, surface.clientHeight)) * VOLUME_SWIPE_GAIN;
			const newVolume = Math.max(0, Math.min(MAX_PLAYER_VOLUME, g.startVolume + deltaVolume));
			if (newVolume === 0) {
				setMuted(true);
				showPlayerFeedback({ type: "volume", value: 0, label: "muted" });
			} else {
				setMuted(false);
				setVolume(newVolume);
				showPlayerFeedback({ type: "volume", value: newVolume });
			}
		},
		[clearLongPressTimer, setMuted, setVolume],
	);

	const onPointerUp = useCallback(
		(event: React.PointerEvent) => {
			if (event.pointerType !== "touch") return;

			const g = gestureRef.current;
			if (!g.active) return;

			clearLongPressTimer();
			endBoost();
			const wasVolumeMode = g.volumeMode;
			const wasMoved = g.moved;
			g.active = false;
			g.volumeMode = false;
			g.moved = false;
			if (wasVolumeMode || wasMoved) return;

			const surface = event.currentTarget;
			const relativeX = (event.clientX - surface.getBoundingClientRect().left) / surface.clientWidth;
			let side: TapSide = "middle";
			if (relativeX < 1 / 3) side = "left";
			else if (relativeX > 2 / 3) side = "right";

			const now = performance.now();

			if (side !== "middle" && now - g.lastTap.time < DOUBLE_TAP_WINDOW_MS && g.lastTap.side === side) {
				clearSingleTapTimer();
				g.lastTap.time = 0;
				seekRelative(side === "left" ? -10 : 10);
				haptic(10);

				return;
			}

			g.lastTap = { time: now, side };
			clearSingleTapTimer();
			g.singleTapTimer = setTimeout(() => {
				g.singleTapTimer = null;
				g.lastTap.time = 0;
				paramsRef.current.onSingleTap();
			}, DOUBLE_TAP_WINDOW_MS);
		},
		[clearLongPressTimer, clearSingleTapTimer, endBoost, seekRelative],
	);

	const onPointerCancel = useCallback(() => {
		const g = gestureRef.current;
		if (!g.active) return;

		clearLongPressTimer();
		endBoost();
		g.active = false;
		g.volumeMode = false;
		g.moved = false;
	}, [clearLongPressTimer, endBoost]);

	// Safety: if the surface unmounts mid-gesture (route change), timers must not fire.
	useEffect(
		() => () => {
			const g = gestureRef.current;
			if (g.longPressTimer) clearTimeout(g.longPressTimer);

			if (g.singleTapTimer) clearTimeout(g.singleTapTimer);
		},
		[],
	);

	return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel };
}
