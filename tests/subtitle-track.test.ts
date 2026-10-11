import { describe, expect, it } from "bun:test";
import { parseSubtitles } from "@/pages/player/components/player-subtitle-overlay";
import { buildSubtitleVtt, buildWebVtt, formatVttTimestamp } from "@/pages/player/utils/subtitle-track.utils";

describe("formatVttTimestamp", () => {
	it("writes hours, minutes, seconds and milliseconds", () => {
		expect(formatVttTimestamp(3723.5)).toBe("01:02:03.500");
		expect(formatVttTimestamp(0)).toBe("00:00:00.000");
	});

	it("rounds to the millisecond and never goes negative", () => {
		expect(formatVttTimestamp(1.0004)).toBe("00:00:01.000");
		expect(formatVttTimestamp(-2)).toBe("00:00:00.000");
	});
});

describe("buildWebVtt", () => {
	it("keeps cue times and strips markup, so the captions carry plain text", () => {
		const cues = parseSubtitles("WEBVTT\n\n00:01:20.500 --> 00:01:23.000\n<i>Hello</i> world");
		const vtt = buildWebVtt(cues);

		expect(vtt.startsWith("WEBVTT\n\n")).toBe(true);
		expect(vtt).toContain("00:01:20.500 --> 00:01:23.000\nHello world");
		expect(vtt).not.toContain("<i>");
	});

	it("converts SRT cues, which browsers cannot load as a track directly", () => {
		const srt = "1\n00:00:01,000 --> 00:00:02,500\nFirst line\n\n2\n00:00:03,000 --> 00:00:04,000\nSecond line\n";
		const vtt = buildWebVtt(parseSubtitles(srt));

		expect(vtt).toContain("00:00:01.000 --> 00:00:02.500\nFirst line");
		expect(vtt).toContain("00:00:03.000 --> 00:00:04.000\nSecond line");
	});

	it("produces a valid empty document for content without cues", () => {
		expect(buildWebVtt([])).toBe("WEBVTT\n\n\n");
	});
});

describe("buildSubtitleVtt", () => {
	it("is the WebVTT of the readable cues", () => {
		const vtt = buildSubtitleVtt("1\n00:00:01,000 --> 00:00:02,000\nHi, there");

		expect(vtt).toContain("00:00:01.000 --> 00:00:02.000\nHi, there");
	});

	it("is undefined without content or without readable cues", () => {
		expect(buildSubtitleVtt(undefined)).toBeUndefined();
		expect(buildSubtitleVtt("")).toBeUndefined();
		expect(buildSubtitleVtt("not subtitles at all")).toBeUndefined();
	});
});
