import { useCallback, useEffect, useRef } from "react";

/**
 * Long-press (touch) opens the card's context menu — the touch equivalent of a
 * mouse right-click. After the hold fires, we synthesise a native `contextmenu`
 * event at the finger position, which the Base UI trigger handles like a real
 * right-click. A short click-suppression window afterwards stops the release
 * from following the poster link underneath.
 */
const LONG_PRESS_MS = 450;
const MOVE_THRESHOLD_PX = 10;
const CLICK_SUPPRESS_MS = 450;

export function useLongPressContextMenu() {
	const stateRef = useRef({
		timer: null as ReturnType<typeof setTimeout> | null,
		startX: 0,
		startY: 0,
		lastX: 0,
		lastY: 0,
		suppressClick: false,
	});

	useEffect(
		() => () => {
			if (stateRef.current.timer) clearTimeout(stateRef.current.timer);
		},
		[],
	);

	const cancel = useCallback(() => {
		const s = stateRef.current;
		if (s.timer) {
			clearTimeout(s.timer);
			s.timer = null;
		}
	}, []);

	const onPointerDown = useCallback((event: React.PointerEvent) => {
		if (event.pointerType !== "touch") return;

		const s = stateRef.current;
		s.startX = event.clientX;
		s.startY = event.clientY;
		s.lastX = event.clientX;
		s.lastY = event.clientY;

		const target = event.currentTarget;
		s.timer = setTimeout(() => {
			s.timer = null;
			try {
				navigator.vibrate(15);
			} catch {
				// Vibration is unavailable in some browsers — the menu still opens.
			}

			target.dispatchEvent(
				new MouseEvent("contextmenu", {
					bubbles: true,
					cancelable: true,
					clientX: s.lastX,
					clientY: s.lastY,
				}),
			);
			// The upcoming pointerup would land on the poster <Link> — swallow it.
			s.suppressClick = true;
			setTimeout(() => {
				s.suppressClick = false;
			}, CLICK_SUPPRESS_MS);
		}, LONG_PRESS_MS);
	}, []);

	const onPointerMove = useCallback(
		(event: React.PointerEvent) => {
			if (event.pointerType !== "touch") return;

			const s = stateRef.current;
			s.lastX = event.clientX;
			s.lastY = event.clientY;
			if (Math.abs(event.clientX - s.startX) > MOVE_THRESHOLD_PX || Math.abs(event.clientY - s.startY) > MOVE_THRESHOLD_PX) {
				cancel();
			}
		},
		[cancel],
	);

	const onPointerUp = useCallback(
		(event: React.PointerEvent) => {
			if (event.pointerType !== "touch") return;

			cancel();
			// Swallow the synthetic click right after an opened long-press menu.
			if (stateRef.current.suppressClick) {
				event.preventDefault();
				event.stopPropagation();
			}
		},
		[cancel],
	);

	const onClickCapture = useCallback((event: React.MouseEvent) => {
		if (stateRef.current.suppressClick) {
			event.preventDefault();
			event.stopPropagation();
		}
	}, []);

	return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: cancel, onClickCapture };
}
