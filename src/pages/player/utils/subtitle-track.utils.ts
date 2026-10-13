import { parseSubtitles, type SubtitleCue } from "../components/player-subtitle-overlay";
import { parseSubtitleMarkup } from "./subtitle-markup.utils";

const pad = (value: number, width = 2) => String(value).padStart(width, "0");

/** WebVTT timestamp `HH:MM:SS.mmm`, rounded to the millisecond and never negative. */
export function formatVttTimestamp(seconds: number): string {
	const totalMs = Math.max(0, Math.round(seconds * 1000));
	const hours = Math.floor(totalMs / 3_600_000);
	const minutes = Math.floor((totalMs % 3_600_000) / 60_000);
	const secs = Math.floor((totalMs % 60_000) / 1000);
	return `${pad(hours)}:${pad(minutes)}:${pad(secs)}.${pad(totalMs % 1000, 3)}`;
}

/** The overlay keeps sanitized markup; a caption track needs the plain text: entities decoded, line breaks kept. */
function cueText(html: string): string {
	return parseSubtitleMarkup(html)
		.map((segment) => (segment.kind === "break" ? "\n" : segment.text))
		.join("")
		.replace(/\r?\n\s*\n/g, "\n")
		.trim();
}

/**
 * WebVTT document for the `<track>` element. The track only gives the video
 * element captions for assistive tech; the overlay draws the picture.
 */
export function buildWebVtt(cues: readonly SubtitleCue[]): string {
	const blocks = cues
		.map((cue) => ({ cue, text: cueText(cue.html) }))
		.filter(({ text }) => text.length > 0)
		.map(({ cue, text }) => `${formatVttTimestamp(cue.startTime)} --> ${formatVttTimestamp(cue.endTime)}\n${text}`);
	return `WEBVTT\n\n${blocks.join("\n\n")}\n`;
}

/**
 * WebVTT of the active subtitles, or undefined without content or readable cues
 * (for example bitmap subtitles).
 */
export function buildSubtitleVtt(content: string | undefined): string | undefined {
	const cues = content ? parseSubtitles(content) : [];
	return cues.length > 0 ? buildWebVtt(cues) : undefined;
}
