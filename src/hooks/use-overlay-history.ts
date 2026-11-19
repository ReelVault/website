import { useEffect, useRef, useState } from "react";
import { safeUuid } from "@/utils/id-utils";

/** History state carrying the synthetic overlay marker pushed while open. */
interface OverlayHistoryState {
	overlayId?: string;
}

function isOverlayHistoryState(value: unknown): value is OverlayHistoryState {
	return typeof value === "object" && value !== null && "overlayId" in value;
}

// Stack of currently mounted overlays. A back gesture pops the top entry, while
// a UI close of the top overlay also pops one entry — the latter must not make
// the overlay underneath think the user pressed Back.
const openOverlayIds: string[] = [];
// The overlay that must ignore the next pop: the one left on top after a UI
// close consumed the synthetic entry. Naming it keeps other listeners (closed
// overlays included) from consuming the suppression first.
let suppressPopFor: string | null = null;

function pushOverlay(id: string): void {
	openOverlayIds.push(id);
}

function removeOverlay(id: string): void {
	const index = openOverlayIds.indexOf(id);
	if (index !== -1) openOverlayIds.splice(index, 1);
}

function isTopOverlay(id: string): boolean {
	return openOverlayIds[openOverlayIds.length - 1] === id;
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
	const [overlayId] = useState(() => safeUuid());
	const closedByPopRef = useRef(false);
	const onCloseRef = useRef(onClose);
	useEffect(() => {
		onCloseRef.current = onClose;
	});

	useEffect(() => {
		closedByPopRef.current = false;
		const onPopState = () => {
			// The listener lives across open/close cycles; ignore pops while closed.
			if (!(isOpen && isTopOverlay(overlayId))) return;

			// A UI close of the overlay above already consumed this pop.
			if (suppressPopFor === overlayId) {
				suppressPopFor = null;

				return;
			}

			closedByPopRef.current = true;
			removeOverlay(overlayId);
			onCloseRef.current();
		};

		if (isOpen) {
			pushOverlay(overlayId);
			window.history.pushState({ ...window.history.state, overlayId }, "");
		}

		window.addEventListener("popstate", onPopState);

		return () => {
			window.removeEventListener("popstate", onPopState);
			removeOverlay(overlayId);

			// Closing via the UI consumes the synthetic entry, but a pop that
			// returns to a lower overlay must not close that lower overlay.
			if (
				isOpen &&
				!closedByPopRef.current &&
				isOverlayHistoryState(window.history.state) &&
				window.history.state.overlayId === overlayId
			) {
				// Only a still-open lower overlay needs to ignore this programmatic pop.
				suppressPopFor = openOverlayIds.at(-1) ?? null;
				window.history.back();
			}
		};
	}, [isOpen, overlayId]);
}
