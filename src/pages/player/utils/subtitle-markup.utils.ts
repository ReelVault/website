/**
 * Subtitle text comes from subtitle files, so it is untrusted. This module turns it into markup
 * for innerHTML: every character is escaped except a fixed set of tags the function generates itself.
 */

const HTML_ESCAPE_REGEX = /[&<>"']/g;
const HTML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const ALLOWED_SUBTITLE_TAG_REGEX =
	/<\/?(?:i|b|u|s)>|<br\s*\/?>|<span class="opacity-75 italic">|<\/span>|<span style="color: (?:#[0-9a-fA-F]{3,8}|[a-zA-Z]+)">/gi;

function escapeHtml(value: string): string {
	return value.replace(HTML_ESCAPE_REGEX, (char) => HTML_ESCAPES[char] ?? char);
}

/** Allows only the fixed set of tags this function itself generates; everything else is escaped. */
export function sanitizeSubtitleMarkup(converted: string): string {
	const preserved: string[] = [];
	const tokenized = converted.replace(ALLOWED_SUBTITLE_TAG_REGEX, (match) => {
		preserved.push(match);

		return `\uE000${preserved.length - 1}\uE000`;
	});

	return escapeHtml(tokenized).replace(/\uE000(\d+)\uE000/g, (_, index: string) => preserved[Number(index)] ?? "");
}
