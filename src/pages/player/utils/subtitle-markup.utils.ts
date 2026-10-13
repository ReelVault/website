/**
 * Subtitle text comes from subtitle files, so it is untrusted. `sanitizeSubtitleMarkup` turns it
 * into a markup string where every character is escaped except a fixed set of tags the function
 * generates itself. `parseSubtitleMarkup` reads that string back into text runs, which the overlay
 * renders as React nodes instead of handing the string to the DOM.
 */

const HTML_ESCAPE_REGEX = /[&<>"']/g;
const HTML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const ALLOWED_SUBTITLE_TAG_REGEX =
	/<\/?(?:i|b|u|s)>|<br\s*\/?>|<span class="opacity-75 italic">|<\/span>|<span style="color: (?:#[0-9a-fA-F]{3,8}|[a-zA-Z]+)">/gi;
const MARKUP_TOKEN_REGEX = /<(\/?)(span|br|i|b|u|s)(?:\s([^>]*))?\/?>|([^<]+)/gi;
const HTML_UNESCAPE_REGEX = /&(?:lt|gt|quot|#39);/g;
const HTML_UNESCAPES: Record<string, string> = { "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" };
const AMP_ENTITY_REGEX = /&amp;/g;
const COLOR_STYLE_REGEX = /color:\s*([#\w]+)/i;

function escapeHtml(value: string): string {
	return value.replace(HTML_ESCAPE_REGEX, (char) => HTML_ESCAPES[char] ?? char);
}

/** Allows only the fixed set of tags this function itself generates; everything else is escaped. */
export function sanitizeSubtitleMarkup(converted: string): string {
	const preserved: string[] = [];
	const tokenized = converted.replace(ALLOWED_SUBTITLE_TAG_REGEX, (match) => {
		preserved.push(match);

		return `${preserved.length - 1}`;
	});

	return escapeHtml(tokenized).replace(/(\d+)/g, (_, index: string) => preserved[Number(index)] ?? "");
}

export interface SubtitleTextRun {
	kind: "text";
	id: number;
	text: string;
	italic: boolean;
	bold: boolean;
	underline: boolean;
	strike: boolean;
	dim: boolean;
	color: string | undefined;
}

export interface SubtitleLineBreak {
	kind: "break";
	id: number;
}

export type SubtitleSegment = SubtitleTextRun | SubtitleLineBreak;

interface OpenSpan {
	dim: boolean;
	color: string | undefined;
}

function decodeMarkupText(value: string): string {
	// `&amp;` is decoded last, so an escaped "&lt;" (literal text in the subtitle) stays "&lt;".
	return value.replace(HTML_UNESCAPE_REGEX, (entity) => HTML_UNESCAPES[entity] ?? entity).replace(AMP_ENTITY_REGEX, "&");
}

/**
 * Reads markup produced by `sanitizeSubtitleMarkup` into text runs with flat style flags.
 * Formatting tags are counted rather than nested, so a misnested pair such as `<i>a<b>b</i>c</b>`
 * styles "c" as bold only, the same way the browser renders it.
 */
export function parseSubtitleMarkup(markup: string): SubtitleSegment[] {
	const openTags: Record<string, number> = {};
	const openSpans: OpenSpan[] = [];
	const segments: SubtitleSegment[] = [];
	const isOpen = (tag: string): boolean => (openTags[tag] ?? 0) > 0;

	for (const [, closing, rawTag, rawAttributes, text] of markup.matchAll(MARKUP_TOKEN_REGEX)) {
		if (text !== undefined) {
			const dim = openSpans.some((span) => span.dim);
			segments.push({
				kind: "text",
				id: segments.length,
				text: decodeMarkupText(text),
				italic: isOpen("i") || dim,
				bold: isOpen("b"),
				underline: isOpen("u"),
				strike: isOpen("s"),
				dim,
				color: openSpans.findLast((span) => span.color)?.color,
			});

			continue;
		}

		// The sanitizer keeps tags in their original case, so names are compared lowercased.
		const tag = (rawTag ?? "").toLowerCase();
		const isClosing = closing === "/";
		const attributes = (rawAttributes ?? "").toLowerCase();

		if (tag === "br") {
			segments.push({ kind: "break", id: segments.length });
		} else if (tag === "span") {
			if (isClosing) openSpans.pop();
			else openSpans.push({ dim: attributes.includes("opacity-75"), color: attributes.match(COLOR_STYLE_REGEX)?.[1] });
		} else if (isClosing) {
			openTags[tag] = Math.max((openTags[tag] ?? 0) - 1, 0);
		} else {
			openTags[tag] = (openTags[tag] ?? 0) + 1;
		}
	}

	return segments;
}
