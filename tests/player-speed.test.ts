import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { getStoredPlaybackRate } from "@/pages/player/utils/player-preferences.storage";
import { nextPlaybackRate, PLAYBACK_SPEED_STEPS } from "@/pages/player/utils/player-speed";

/**
 * The player offers speeds up to 3×, the `<` / `>` shortcuts step through them, and a speed stored
 * above 2× is read back as it was stored (up to 3×) instead of being capped at 2×.
 */

const STORAGE_KEY = "reelvault:player:playbackRate";

describe("player speed steps", () => {
	test("the steps run up to 3× and include 2.5× and 3×", () => {
		expect(PLAYBACK_SPEED_STEPS).toContain(2.5);
		expect(PLAYBACK_SPEED_STEPS.at(-1)).toBe(3);
	});

	test("the shortcuts step up and down through the steps", () => {
		expect(nextPlaybackRate(2, 1)).toBe(2.5);
		expect(nextPlaybackRate(2.5, 1)).toBe(3);
		expect(nextPlaybackRate(2.5, -1)).toBe(2);
		expect(nextPlaybackRate(1, -1)).toBe(0.75);
	});

	test("at the top and the bottom the rate stays where it is", () => {
		expect(nextPlaybackRate(3, 1)).toBe(3);
		expect(nextPlaybackRate(0.25, -1)).toBe(0.25);
	});
});

describe("stored playback rate", () => {
	const store = new Map<string, string>();
	const originalWindow = globalThis.window;
	const originalLocalStorage = globalThis.localStorage;

	beforeEach(() => {
		store.clear();
		globalThis.window = {} as unknown as Window & typeof globalThis;
		globalThis.localStorage = {
			getItem: (key: string) => store.get(key) ?? null,
			setItem: (key: string, value: string) => store.set(key, value),
			removeItem: (key: string) => store.delete(key),
		} as unknown as Storage;
	});

	afterEach(() => {
		globalThis.window = originalWindow;
		globalThis.localStorage = originalLocalStorage;
	});

	test("a stored speed above 2× is kept", () => {
		store.set(STORAGE_KEY, "2.5");

		expect(getStoredPlaybackRate()).toBe(2.5);
	});

	test("a stored speed above 3× is limited to 3×", () => {
		store.set(STORAGE_KEY, "3.5");

		expect(getStoredPlaybackRate()).toBe(3);
	});

	test("a stored speed below a quarter is raised to a quarter", () => {
		store.set(STORAGE_KEY, "0.1");

		expect(getStoredPlaybackRate()).toBe(0.25);
	});

	test("a value that is not a number falls back to normal speed", () => {
		store.set(STORAGE_KEY, "fast");

		expect(getStoredPlaybackRate()).toBe(1);
	});
});
