import { describe, expect, test } from "bun:test";
import { parseSubtitleMarkup, type SubtitleTextRun, sanitizeSubtitleMarkup } from "@/pages/player/utils/subtitle-markup.utils";

/**
 * The sanitizer is the first guard between a subtitle file and the page: cue markup is read back
 * by parseSubtitleMarkup and rendered as React nodes. Every attack below must come out as inert
 * text, and whatever markup survives must be one of the fixed tags the sanitizer itself allows.
 */

const ALLOWED_TAG =
	/^(?:<\/?(?:i|b|u|s)>|<br\s*\/?>|<span class="opacity-75 italic">|<\/span>|<span style="color: (?:#[0-9a-fA-F]{3,8}|[a-zA-Z]+)">)$/;

const TAG = /<[^>]*>/g;
const HANDLER_ATTRIBUTE = /on\w+=/i;

function tagsIn(html: string): string[] {
	return html.match(TAG) ?? [];
}

describe("subtitle markup sanitizer", () => {
	test("script elements are escaped into visible text", () => {
		const html = sanitizeSubtitleMarkup('<script>alert("x")</script>');

		expect(html).not.toContain("<script");
		expect(html).toContain("&lt;script&gt;");
	});

	test("event handlers on allowed tag names are escaped, not rendered", () => {
		for (const payload of ['<b onclick="alert(1)">x</b>', "<i onmouseover=alert(1)>y</i>", '<u style="x">z</u>']) {
			const html = sanitizeSubtitleMarkup(payload);
			expect(tagsIn(html).every((tag) => ALLOWED_TAG.test(tag))).toBe(true);
			expect(tagsIn(html).some((tag) => HANDLER_ATTRIBUTE.test(tag))).toBe(false);
		}
	});

	test("image and iframe payloads cannot load anything", () => {
		for (const payload of ["<img src=x onerror=alert(1)>", '<iframe src="javascript:alert(1)"></iframe>', '<svg onload="alert(1)">']) {
			const html = sanitizeSubtitleMarkup(payload);
			expect(tagsIn(html)).toEqual([]);
			expect(html).toContain("&lt;");
		}
	});

	test("the formatting tags that subtitles use survive intact", () => {
		const html = sanitizeSubtitleMarkup("<i>one</i> <b>two</b> <u>three</u> <s>four</s><br/>five");

		expect(html).toBe("<i>one</i> <b>two</b> <u>three</u> <s>four</s><br/>five");
	});

	test("colour spans keep only hex or plain colour names", () => {
		expect(sanitizeSubtitleMarkup('<span style="color: #ff0000">red</span>')).toContain('<span style="color: #ff0000">');
		expect(sanitizeSubtitleMarkup('<span style="color: red;background:url(x)">n</span>')).not.toContain("<span style=");
		expect(sanitizeSubtitleMarkup('<span style="color: red" onclick="x">n</span>')).not.toContain("<span style=");
	});

	test("ampersands and quotes in ordinary text are escaped", () => {
		expect(sanitizeSubtitleMarkup(`Tom & "Jerry" 'x'`)).toBe("Tom &amp; &quot;Jerry&quot; &#39;x&#39;");
	});

	test("random inputs never yield a tag outside the allowed set", () => {
		const alphabet = [
			"<",
			">",
			"/",
			'"',
			"'",
			"=",
			"&",
			" ",
			"b",
			"i",
			"s",
			"u",
			"r",
			"span",
			"style",
			"color",
			"#fff",
			"br",
			"",
			"0",
			"x",
			";",
		];
		let seed = 42;
		const next = () => {
			seed = (seed * 1103515245 + 12345) & 0x7fffffff;

			return seed;
		};

		for (let round = 0; round < 800; round += 1) {
			let input = "";
			const length = 1 + (next() % 40);
			for (let index = 0; index < length; index += 1) input += alphabet[next() % alphabet.length];

			const html = sanitizeSubtitleMarkup(input);
			for (const tag of tagsIn(html)) {
				expect(ALLOWED_TAG.test(tag)).toBe(true);
			}
		}
	});
});

describe("sanitizer edge cases", () => {
	test("empty and whitespace-only cues come out empty", () => {
		expect(sanitizeSubtitleMarkup("")).toBe("");
		expect(sanitizeSubtitleMarkup("   ")).toBe("   ");
	});
});

describe("subtitle markup parser", () => {
	const textRuns = (markup: string): SubtitleTextRun[] =>
		parseSubtitleMarkup(markup).filter((segment): segment is SubtitleTextRun => segment.kind === "text");

	test("formatting tags set flat style flags", () => {
		const runs = textRuns("<i>one</i> <b>two</b> <u>three</u> <s>four</s>");

		expect(runs.map((run) => [run.text, run.italic, run.bold, run.underline, run.strike])).toEqual([
			["one", true, false, false, false],
			[" ", false, false, false, false],
			["two", false, true, false, false],
			[" ", false, false, false, false],
			["three", false, false, true, false],
			[" ", false, false, false, false],
			["four", false, false, false, true],
		]);
	});

	test("misnested formatting styles the text the way the browser does", () => {
		// After </i> the browser keeps "c" bold but no longer italic.
		expect(textRuns("<i>a<b>b</i>c</b>").map((run) => [run.text, run.italic, run.bold])).toEqual([
			["a", true, false],
			["b", true, true],
			["c", false, true],
		]);
	});

	test("line breaks become break segments with sequential ids", () => {
		const segments = parseSubtitleMarkup("a<br />b<br/>c");

		expect(segments.map((segment) => segment.kind)).toEqual(["text", "break", "text", "break", "text"]);
		expect(segments.map((segment) => segment.id)).toEqual([0, 1, 2, 3, 4]);
	});

	test("escaped text reads back to the original characters", () => {
		const source = `Tom & "Jerry" <3 'x' &lt;`;

		expect(
			textRuns(sanitizeSubtitleMarkup(source))
				.map((run) => run.text)
				.join(""),
		).toBe(source);
	});

	test("colour spans carry the colour and voice spans are dimmed and italic", () => {
		const runs = textRuns('<span class="opacity-75 italic">Narrator: </span>hi <span style="color: #ff0000">red</span>');

		expect(runs[0]).toMatchObject({ text: "Narrator: ", dim: true, italic: true });
		expect(runs[1]).toMatchObject({ text: "hi ", dim: false, italic: false, color: undefined });
		expect(runs[2]).toMatchObject({ text: "red", color: "#ff0000" });
	});

	test("unmatched closing tags change nothing", () => {
		expect(textRuns("</b>x</span>y").map((run) => [run.text, run.bold])).toEqual([
			["x", false],
			["y", false],
		]);
	});
});
