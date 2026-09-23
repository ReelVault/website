import { useEffect, useRef } from "react";

/** History state carrying the synthetic overlay marker pushed while open. */
interface OverlayHistoryState {
	overlayOpen?: boolean;
}

function isOverlayHistoryState(value: unknown): value is OverlayHistoryState {
	return typeof value === "object" && value !== null && "overlayOpen" in value;
}

/**
 * Closes an overlay (dialog/sheet) on browser/hardware Back instead of
 * navigating away. While the overlay is open a synthetic history entry is
 * pushed; popping it (Back gesture) closes the overlay. Closing via the UI
 * consumes the synthetic entry so the stack stays balanced.
 *
 * Tradeoff: if the user navigates programmatically while the overlay is open
 * (e.g. picks a search result), the synthetic entry stays behind — one extra
 * Back press on that page. Safe by design: never closes mid-navigation.
 */
export function useOverlayHistory(isOpen: boolean, onClose: () => void) {
	const onCloseRef = useRef(onClose);
	useEffect(() => {
		onCloseRef.current = onClose;
	});

	useEffect(() => {
		let closedByPop = false;
		const onPopState = () => {
			// The listener lives across open/close cycles; ignore pops while closed.
			if (!isOpen) return;

			closedByPop = true;
			onCloseRef.current();
		};

		if (isOpen) {
			window.history.pushState({ ...window.history.state, overlayOpen: true }, "");
		}

		window.addEventListener("popstate", onPopState);

		return () => {
			window.removeEventListener("popstate", onPopState);
			if (isOpen && !closedByPop && isOverlayHistoryState(window.history.state) && window.history.state.overlayOpen) {
				window.history.back();
			}
		};
	}, [isOpen]);
}
