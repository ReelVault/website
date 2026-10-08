import { useSyncExternalStore } from "react";

export type SleepTimerState = { kind: "off" } | { kind: "timer"; minutes: number; endsAt: number } | { kind: "episode" };

const OFF: SleepTimerState = { kind: "off" };

// Module-level store: the timer belongs to the viewing session, not to one episode —
// it must survive the /player/$id change when auto-advancing to the next episode.
let state: SleepTimerState = OFF;
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
	listeners.add(listener);

	return () => listeners.delete(listener);
}

export function setSleepTimer(next: SleepTimerState): void {
	state = next;
	for (const listener of listeners) listener();
}

export function useSleepTimer(): SleepTimerState {
	return useSyncExternalStore(
		subscribe,
		() => state,
		() => OFF,
	);
}

/** True (and clears the timer) when the episode that just ended was the last one the viewer wanted. */
export function consumeSleepAfterEpisode(): boolean {
	if (state.kind !== "episode") return false;

	setSleepTimer(OFF);

	return true;
}
