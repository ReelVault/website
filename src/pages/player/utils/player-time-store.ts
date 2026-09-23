import { getLocaleTag } from "@/utils/format-utils";

/**
 * External store for the playback playhead. Time updates arrive ~4x/s from
 * "timeupdate" (rAF-batched) — far too often to push through React state
 * without re-rendering the whole player chrome. Subscribers opt in per
 * component via useSyncExternalStore (see usePlayerTime in player-context).
 */

export interface PlayerTimeSnapshot {
	currentTime: number;
	finishTime: string;
}

export interface PlayerTimeStore {
	subscribe: (listener: () => void) => () => void;
	getSnapshot: () => PlayerTimeSnapshot;
	set: (absoluteTime: number) => void;
	setDuration: (duration: number) => void;
}

// Same formatting as the previous getFinishTime() in the controller — do not
// clamp remaining time (negative remaining intentionally renders a past time).
const formatFinishTime = (remainingSeconds: number): string => {
	const finishDate = new Date(Date.now() + remainingSeconds * 1000);

	return finishDate.toLocaleTimeString(getLocaleTag(), { hour: "2-digit", minute: "2-digit" });
};

export function createPlayerTimeStore(initialDuration = 0): PlayerTimeStore {
	let duration = initialDuration;
	let currentTime = 0;
	// remaining = duration - currentTime = duration at position 0 — matches the
	// controller's previous getFinishTime() output before the first tick.
	let snapshot: PlayerTimeSnapshot = { currentTime: 0, finishTime: formatFinishTime(initialDuration) };
	const listeners = new Set<() => void>();

	const commit = () => {
		snapshot = { currentTime, finishTime: formatFinishTime(duration - currentTime) };
		for (const listener of listeners) listener();
	};

	return {
		subscribe(listener) {
			listeners.add(listener);

			return () => {
				listeners.delete(listener);
			};
		},
		getSnapshot: () => snapshot,
		set(absoluteTime) {
			// Paused timeupdate can re-report the same position — no snapshot change,
			// no subscriber notifications (mirrors React bailing on equal setState).
			if (absoluteTime === currentTime) return;

			currentTime = absoluteTime;
			commit();
		},
		setDuration(nextDuration) {
			if (nextDuration === duration) return;

			duration = nextDuration;
			commit();
		},
	};
}
