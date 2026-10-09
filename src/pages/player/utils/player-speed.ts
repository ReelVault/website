/** Playback speed steps offered by the player settings and the `<` / `>` shortcuts. */
export const PLAYBACK_SPEED_STEPS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3] as const;

const DESCENDING_SPEED_STEPS: readonly number[] = PLAYBACK_SPEED_STEPS.toReversed();

/** The next step above (`1`) or below (`-1`) the current rate; at either end the rate stays where it is. */
export function nextPlaybackRate(current: number, direction: 1 | -1): number {
	if (direction === 1) {
		return PLAYBACK_SPEED_STEPS.find((step) => step > current) ?? current;
	}

	return DESCENDING_SPEED_STEPS.find((step) => step < current) ?? current;
}
