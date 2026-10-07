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

export function createPlayerTimeStore(initialDuration = 0): PlayerTimeStore {
	let duration = initialDuration;
	let currentTime = 0;
	// The finish clock only changes once a minute, but commit() runs ~4x/s; cache
	// the formatted string and re-run Intl only when the minute bucket rolls over.
	// Same formatting as the previous getFinishTime() — do not clamp remaining time
	// (a negative remaining intentionally renders a past time).
	let lastFinishMinute = Number.NaN;
	let lastFinishTime = "";
	const finishTimeFor = (remainingSeconds: number): string => {
		const finishMs = Date.now() + remainingSeconds * 1000;
		const minute = Math.floor(finishMs / 60_000);
		if (minute !== lastFinishMinute) {
			lastFinishMinute = minute;
			lastFinishTime = new Date(finishMs).toLocaleTimeString(getLocaleTag(), { hour: "2-digit", minute: "2-digit" });
		}

		return lastFinishTime;
	};

	// remaining = duration - currentTime = duration at position 0 — matches the
	// controller's previous getFinishTime() output before the first tick.
	let snapshot: PlayerTimeSnapshot = { currentTime: 0, finishTime: finishTimeFor(initialDuration) };
	const listeners = new Set<() => void>();

	const commit = () => {
		snapshot = { currentTime, finishTime: finishTimeFor(duration - currentTime) };
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
