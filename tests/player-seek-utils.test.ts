import { describe, expect, test } from "bun:test";
import { isPositionInRanges, isSafeSeek } from "../src/pages/player/utils/player-utils";

describe("player seek utils", () => {
	test("isPositionInRanges checks if a target position falls inside any transcoded range", () => {
		const ranges = [
			{ startTime: 0, endTime: 120 },
			{ startTime: 300, endTime: 450 },
		];

		expect(isPositionInRanges(50, ranges)).toBe(true);
		expect(isPositionInRanges(0, ranges)).toBe(true);
		expect(isPositionInRanges(120, ranges)).toBe(true);
		expect(isPositionInRanges(120.4, ranges)).toBe(true); // within 0.5 tolerance

		expect(isPositionInRanges(200, ranges)).toBe(false);
		expect(isPositionInRanges(500, ranges)).toBe(false);
		expect(isPositionInRanges(10, [])).toBe(false);
	});

	test("isSafeSeek returns true when target is in server transcoded ranges", () => {
		const ranges = [{ startTime: 0, endTime: 100 }];

		// No HTMLVideoElement mock available/needed
		expect(isSafeSeek(50, 0, null, ranges)).toBe(true);
		expect(isSafeSeek(150, 0, null, ranges)).toBe(false);
	});
});
