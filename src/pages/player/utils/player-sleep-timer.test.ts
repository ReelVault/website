import { afterEach, describe, expect, test } from "bun:test";
import { consumeSleepAfterEpisode, setSleepTimer } from "./player-sleep-timer";

afterEach(() => setSleepTimer({ kind: "off" }));

describe("sleep timer store", () => {
	test("consuming a stop-after-episode timer reports it once and clears it", () => {
		setSleepTimer({ kind: "episode" });

		expect(consumeSleepAfterEpisode()).toBe(true);
		expect(consumeSleepAfterEpisode()).toBe(false);
	});

	test("minute timers are not consumed by an episode ending", () => {
		setSleepTimer({ kind: "timer", minutes: 30, endsAt: Date.now() + 30 * 60_000 });

		expect(consumeSleepAfterEpisode()).toBe(false);
	});
});
