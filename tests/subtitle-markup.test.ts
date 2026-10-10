import { describe, expect, test } from "bun:test";
import { sanitizeSubtitleMarkup } from "@/pages/player/utils/subtitle-markup.utils";

/**
 * Subtitle cues are rendered with innerHTML, so the sanitizer is the only thing between a
 * subtitle file and the page. Every attack below must come out as inert text, and whatever
 * markup survives must be one of the fixed tags the sanitizer itself allows.
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
