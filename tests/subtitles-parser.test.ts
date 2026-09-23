import { describe, expect, it } from "bun:test";
import { parseSubtitles } from "@/pages/player/components/player-subtitle-overlay";

describe("parseSubtitles", () => {
	it("parses WebVTT timestamps and simple text", () => {
		const vtt = `WEBVTT

00:01:20.500 --> 00:01:23.000
Hello world!`;
		const cues = parseSubtitles(vtt);
		expect(cues).toHaveLength(1);
		expect(cues[0]?.startTime).toBe(80.5);
		expect(cues[0]?.endTime).toBe(83);
		expect(cues[0]?.html).toBe("Hello world!");
		expect(cues[0]?.vAlign).toBe("bottom");
		expect(cues[0]?.hAlign).toBe("center");
	});

	it("handles italic, bold, underline, strikethrough, and color tags", () => {
		const vtt = `WEBVTT

00:00:10.000 --> 00:00:15.000
<i>Italic text</i> and <b>Bold</b> and <u>Underline</u> and <s>Strike</s> and <c.yellow>Yellow text</c>`;
		const cues = parseSubtitles(vtt);
		expect(cues).toHaveLength(1);
		expect(cues[0]?.html).toContain("<i>Italic text</i>");
		expect(cues[0]?.html).toContain("<b>Bold</b>");
		expect(cues[0]?.html).toContain("<u>Underline</u>");
		expect(cues[0]?.html).toContain("<s>Strike</s>");
		expect(cues[0]?.html).toContain('style="color: #facc15"');
	});

	it("handles ASS style tags and positioning", () => {
		const assVtt = `WEBVTT

00:00:05.000 --> 00:00:10.000
{\\an8}{\\i1}Top sign note{\\i0}`;
		const cues = parseSubtitles(assVtt);
		expect(cues).toHaveLength(1);
		expect(cues[0]?.vAlign).toBe("top");
		expect(cues[0]?.hAlign).toBe("center");
		expect(cues[0]?.html).toContain("<i>Top sign note</i>");
	});

	it("handles WebVTT line and align cue settings", () => {
		const vtt = `WEBVTT

00:00:01.000 --> 00:00:05.000 line:10% align:start
Left top speaker text`;
		const cues = parseSubtitles(vtt);
		expect(cues).toHaveLength(1);
		expect(cues[0]?.vAlign).toBe("top");
		expect(cues[0]?.hAlign).toBe("left");
	});
});
