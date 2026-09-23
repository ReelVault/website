import { describe, expect, test } from "bun:test";
import type { TranscodeProgressResponse } from "@reelvault/sdk";
import { TRANSCODE_POLL_INTERVAL_MS, transcodePollInterval } from "../src/client/hooks/use-player-playback";

function progress(overrides: Partial<TranscodeProgressResponse> = {}): TranscodeProgressResponse {
	return {
		sessionId: "session-1",
		mediaFileId: "file-1",
		state: "transcoding",
		active: true,
		segmentDuration: 4,
		segments: 10,
		transcodedSeconds: 40,
		transcodedUntil: 40,
		duration: 600,
		remainingSeconds: 560,
		progressPercent: 6.7,
		ranges: [{ startTime: 0, endTime: 40, startSegment: 0, endSegment: 9, segmentCount: 10 }],
		...overrides,
	};
}

describe("transcode poll interval", () => {
	test("keeps polling while transcoding is under way", () => {
		expect(transcodePollInterval(undefined)).toBe(TRANSCODE_POLL_INTERVAL_MS);
		expect(transcodePollInterval(progress())).toBe(TRANSCODE_POLL_INTERVAL_MS);
	});

	test("keeps polling for pending/inactive sessions — ffmpeg may just not have spawned yet", () => {
		expect(transcodePollInterval(progress({ state: "pending", active: false, ranges: [] }))).toBe(TRANSCODE_POLL_INTERVAL_MS);
	});

	test("stops only when the encode finished (99% tolerance)", () => {
		expect(transcodePollInterval(progress({ state: "completed", progressPercent: 100 }))).toBe(false);
		expect(transcodePollInterval(progress({ progressPercent: 99 }))).toBe(false);
		expect(transcodePollInterval(progress({ progressPercent: 98.9 }))).toBe(TRANSCODE_POLL_INTERVAL_MS);
		expect(transcodePollInterval(progress({ transcodedUntil: 594.1 }))).toBe(false); // 99.02% coverage
		expect(transcodePollInterval(progress({ transcodedUntil: 593 }))).toBe(TRANSCODE_POLL_INTERVAL_MS); // 98.8%
	});

	test("does not divide by a missing duration", () => {
		expect(transcodePollInterval(progress({ duration: null, progressPercent: null }))).toBe(TRANSCODE_POLL_INTERVAL_MS);
	});
});
