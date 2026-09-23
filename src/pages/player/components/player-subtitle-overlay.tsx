import { cn } from "cn";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { usePlayerSubtitles, usePlayerTime } from "../player-context";

export type SubtitleVerticalAlign = "top" | "middle" | "bottom";

export type SubtitleHorizontalAlign = "left" | "center" | "right";

export interface SubtitleCue {
	id: string;
	startTime: number;
	endTime: number;
	html: string;
	vAlign: SubtitleVerticalAlign;
	hAlign: SubtitleHorizontalAlign;
}

function parseTimestamp(timestamp: string): number | null {
	const clean = timestamp.trim().replace(",", ".");
	const parts = clean.split(":");
	if (parts.length === 3) {
		const hours = Number.parseFloat(parts[0] ?? "0");
		const minutes = Number.parseFloat(parts[1] ?? "0");
		const seconds = Number.parseFloat(parts[2] ?? "0");
		if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds)) return null;

		return hours * 3600 + minutes * 60 + seconds;
	}

	if (parts.length === 2) {
		const minutes = Number.parseFloat(parts[0] ?? "0");
		const seconds = Number.parseFloat(parts[1] ?? "0");
		if (Number.isNaN(minutes) || Number.isNaN(seconds)) return null;

		return minutes * 60 + seconds;
	}

	return null;
}

const WHITESPACE_SPLIT_REGEX = /\s+/;
const AN_TAG_REGEX = /\{\\an([1-9])\}/;
const ITALIC_ON_REGEX = /\{\\i1\}/gi;
const ITALIC_OFF_REGEX = /\{\\i0\}/gi;
const BOLD_ON_REGEX = /\{\\b1\}/gi;
const BOLD_OFF_REGEX = /\{\\b0\}/gi;
const UNDERLINE_ON_REGEX = /\{\\u1\}/gi;
const UNDERLINE_OFF_REGEX = /\{\\u0\}/gi;
const STRIKE_ON_REGEX = /\{\\s1\}/gi;
const STRIKE_OFF_REGEX = /\{\\s0\}/gi;
const TAG_STRIP_REGEX = /\{[^}]+\}/g;
const VOICE_SPAN_REGEX = /<v(?:\.[\w-]+)?\s+([^>]+)>/gi;
const VOICE_CLOSE_REGEX = /<\/v>/gi;
const COLOR_CLASS_REGEX = /<c\.(\w+)>(.*?)<\/c>/gi;
const FONT_COLOR_REGEX = /<font color=["']?([^"'>]+)["']?>(.*?)<\/font>/gi;
const NEWLINE_GLOBAL_REGEX = /\n/g;
const CRLF_REGEX = /\r\n/g;
const CR_REGEX = /\r/g;
const DOUBLE_NEWLINE_SPLIT_REGEX = /\n\n+/;
const CUE_SETTINGS_SPLIT_REGEX = /\s{2,}|(?<=[^\s])\s+(?=[a-zA-Z]+:)/;

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: cue-setting grammar is parsed token by token; splitting it would scatter one grammar across helpers
function parseCueSettings(settingsStr: string): {
	vAlign: SubtitleVerticalAlign;
	hAlign: SubtitleHorizontalAlign;
} {
	let vAlign: SubtitleVerticalAlign = "bottom";
	let hAlign: SubtitleHorizontalAlign = "center";

	if (!settingsStr) return { vAlign, hAlign };

	const parts = settingsStr.trim().split(WHITESPACE_SPLIT_REGEX);
	for (const part of parts) {
		const [key, val] = part.split(":");
		if (!(key && val)) continue;

		if (key === "align") {
			if (val === "start" || val === "left") hAlign = "left";
			else if (val === "end" || val === "right") hAlign = "right";
			else if (val === "center" || val === "middle") hAlign = "center";
		} else if (key === "line") {
			if (val.endsWith("%")) {
				const num = Number.parseFloat(val);
				if (!Number.isNaN(num)) {
					if (num < 33) vAlign = "top";
					else if (num < 66) vAlign = "middle";
					else vAlign = "bottom";
				}
			} else {
				const lineNum = Number.parseFloat(val);
				if (!Number.isNaN(lineNum)) {
					if (lineNum >= 0 && lineNum <= 3) vAlign = "top";
					else if (lineNum < 0) vAlign = "bottom";
				}
			}
		} else if (key === "position") {
			const posNum = Number.parseFloat(val);
			if (!Number.isNaN(posNum)) {
				if (posNum < 35) hAlign = "left";
				else if (posNum > 65) hAlign = "right";
				else hAlign = "center";
			}
		}
	}

	return { vAlign, hAlign };
}

const COLOR_MAP: Record<string, string> = {
	yellow: "#facc15",
	red: "#f87171",
	green: "#4ade80",
	blue: "#60a5fa",
	cyan: "#22d3ee",
	magenta: "#e879f9",
	white: "#ffffff",
	black: "#000000",
};

const HTML_ESCAPE_REGEX = /[&<>"']/g;
const HTML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const ALLOWED_SUBTITLE_TAG_REGEX =
	/<\/?(?:i|b|u|s)>|<br\s*\/?>|<span class="opacity-75 italic">|<\/span>|<span style="color: (?:#[0-9a-fA-F]{3,8}|[a-zA-Z]+)">/gi;
const HEX_COLOR_REGEX = /^#[0-9a-f]{3}$|^#[0-9a-f]{6}$|^#[0-9a-f]{8}$/;

function escapeHtml(value: string): string {
	return value.replace(HTML_ESCAPE_REGEX, (char) => HTML_ESCAPES[char] ?? char);
}

/** Allows only the fixed set of tags this function itself generates; everything else is escaped. */
function sanitizeSubtitleMarkup(converted: string): string {
	const preserved: string[] = [];
	const tokenized = converted.replace(ALLOWED_SUBTITLE_TAG_REGEX, (match) => {
		preserved.push(match);

		return `\uE000${preserved.length - 1}\uE000`;
	});

	return escapeHtml(tokenized).replace(/\uE000(\d+)\uE000/g, (_, index: string) => preserved[Number(index)] ?? "");
}

/** Font colors come from untrusted subtitle text — accept only hex or a known named color. */
function normalizeFontColor(value: string): string | undefined {
	const trimmed = value.trim().toLowerCase();
	if (HEX_COLOR_REGEX.test(trimmed)) return trimmed;

	return trimmed in COLOR_MAP ? trimmed : undefined;
}

function formatSubtitleTextToHtml(rawText: string): {
	html: string;
	vAlignOverride?: SubtitleVerticalAlign;
	hAlignOverride?: SubtitleHorizontalAlign;
} {
	let vAlignOverride: SubtitleVerticalAlign | undefined;
	let hAlignOverride: SubtitleHorizontalAlign | undefined;

	const anMatch = rawText.match(AN_TAG_REGEX);
	if (anMatch?.[1]) {
		const num = Number.parseInt(anMatch[1], 10);
		if (num >= 7 && num <= 9) vAlignOverride = "top";
		else if (num >= 4 && num <= 6) vAlignOverride = "middle";
		else vAlignOverride = "bottom";

		if (num === 1 || num === 4 || num === 7) hAlignOverride = "left";
		else if (num === 3 || num === 6 || num === 9) hAlignOverride = "right";
		else hAlignOverride = "center";
	}

	let text = rawText
		.replace(ITALIC_ON_REGEX, "<i>")
		.replace(ITALIC_OFF_REGEX, "</i>")
		.replace(BOLD_ON_REGEX, "<b>")
		.replace(BOLD_OFF_REGEX, "</b>")
		.replace(UNDERLINE_ON_REGEX, "<u>")
		.replace(UNDERLINE_OFF_REGEX, "</u>")
		.replace(STRIKE_ON_REGEX, "<s>")
		.replace(STRIKE_OFF_REGEX, "</s>")
		.replace(TAG_STRIP_REGEX, "");

	text = text.replace(VOICE_SPAN_REGEX, '<span class="opacity-75 italic">$1: </span>');
	text = text.replace(VOICE_CLOSE_REGEX, "");

	text = text.replace(COLOR_CLASS_REGEX, (_, colorName: string, inner: string) => {
		const hex = COLOR_MAP[colorName.toLowerCase()];

		return hex ? `<span style="color: ${hex}">${inner}</span>` : inner;
	});

	text = text.replace(FONT_COLOR_REGEX, (_, color: string, inner: string) => {
		const safeColor = normalizeFontColor(color);

		return safeColor ? `<span style="color: ${safeColor}">${inner}</span>` : inner;
	});

	// Subtitle text is untrusted (third-party providers, uploads): escape it, then
	// restore only the fixed markup generated above.
	const html = sanitizeSubtitleMarkup(text.replace(NEWLINE_GLOBAL_REGEX, "<br />"));

	return { html, vAlignOverride, hAlignOverride };
}

export function parseSubtitles(content: string): SubtitleCue[] {
	if (!content || typeof content !== "string") return [];

	const cues: SubtitleCue[] = [];
	const normalized = content.replace(CRLF_REGEX, "\n").replace(CR_REGEX, "\n");
	const blocks = normalized.split(DOUBLE_NEWLINE_SPLIT_REGEX);

	for (let index = 0; index < blocks.length; index++) {
		const block = blocks[index]?.trim();
		if (!block) continue;

		const lines = block.split("\n");
		if (lines.length === 0) continue;

		let timeLineIndex = -1;
		for (let i = 0; i < lines.length; i++) {
			if (lines[i]?.includes("-->")) {
				timeLineIndex = i;
				break;
			}
		}

		if (timeLineIndex === -1) continue;

		const timeLine = lines[timeLineIndex];
		if (!timeLine) continue;

		const [timeRange, ...settingsRest] = timeLine.split(CUE_SETTINGS_SPLIT_REGEX);
		const [startStr, endStr] = (timeRange ?? "").split("-->").map((s) => s.trim().split(" ")[0]);
		if (!(startStr && endStr)) continue;

		const startTime = parseTimestamp(startStr);
		const endTime = parseTimestamp(endStr);
		if (startTime === null || endTime === null || endTime <= startTime) continue;

		const settingsStr = settingsRest.join(" ");
		const baseSettings = parseCueSettings(settingsStr);

		const textLines = lines.slice(timeLineIndex + 1);
		const rawText = textLines.join("\n").trim();
		if (!rawText) continue;

		const { html, vAlignOverride, hAlignOverride } = formatSubtitleTextToHtml(rawText);

		cues.push({
			id: `cue-${index}-${startTime}`,
			startTime,
			endTime,
			html,
			vAlign: vAlignOverride ?? baseSettings.vAlign,
			hAlign: hAlignOverride ?? baseSettings.hAlign,
		});
	}

	// Sorting once, while parsing, makes later active-cue lookup easier and faster.
	return cues.toSorted((a, b) => a.startTime - b.startTime);
}

/**
 * Sizes are intentionally NOT capped by a low px limit.
 * `clamp(min, Nvw, max)` scales with screen width, so
 * the same "100%" looks physically the same on FullHD, 2K and 4K — as long as `max`
 * is not reached in the typical resolution range. The earlier `max: 1.5rem`
 * cut scaling at ~1500px width, so from FullHD up the size became
 * a fixed pixel cap — and the same px on a higher-density screen
 * looks smaller. The `max` below is chosen so it does not cut off in the typical range
 * up to 4K (~3840px wide); raise it further if you target even larger screens.
 */
const SIZE_STYLES = {
	small: "clamp(1.125rem, 1.35vw, 3rem)",
	normal: "clamp(1.5rem, 1.9vw, 4.5rem)",
	large: "clamp(1.875rem, 2.4vw, 5.5rem)",
	"extra-large": "clamp(2.25rem, 3vw, 6.5rem)",
} as const;

const COLOR_CLASSES = {
	white: "text-white",
	yellow: "text-yellow-300",
	cyan: "text-cyan-300",
	green: "text-green-300",
};

const BG_CLASSES = {
	none: "bg-transparent shadow-none",
	semi: "bg-black/60 shadow-lg",
	solid: "bg-black shadow-lg",
};

interface CueStyling {
	sizeStyle: string;
	colorClass: string;
	bgClass: string;
}

/**
 * Returns the active cues keeping a stable reference as long as the set
 * of actually visible cues does not change. That lets `usePlayerTime` tick
 * several times a second while child components (wrapped in `memo`)
 * are not re-rendered when nothing changed on screen anyway.
 */
function useActiveCues(cues: readonly SubtitleCue[], effectiveTime: number): SubtitleCue[] {
	const [activeCues, setActiveCues] = useState<SubtitleCue[]>(() =>
		cues.filter((cue) => effectiveTime >= cue.startTime && effectiveTime <= cue.endTime),
	);
	const lastKeyRef = useRef<string>(activeCues.length === 0 ? "" : activeCues.map((cue) => cue.id).join("|"));

	useEffect(() => {
		const next = cues.filter((cue) => effectiveTime >= cue.startTime && effectiveTime <= cue.endTime);
		const nextKey = next.length === 0 ? "" : next.map((cue) => cue.id).join("|");

		if (nextKey !== lastKeyRef.current) {
			lastKeyRef.current = nextKey;
			setActiveCues(next);
		}
	}, [cues, effectiveTime]);

	return activeCues;
}

interface CueBuckets {
	top: SubtitleCue[];
	middle: SubtitleCue[];
	bottom: SubtitleCue[];
}

function splitCuesByPosition(cues: readonly SubtitleCue[], subtitlePosition: "top" | "middle" | "bottom"): CueBuckets {
	const buckets: CueBuckets = { top: [], middle: [], bottom: [] };

	for (const cue of cues) {
		if (subtitlePosition === "top") buckets.top.push(cue);
		else if (subtitlePosition === "middle") buckets.middle.push(cue);
		else if (cue.vAlign === "top") buckets.top.push(cue);
		else if (cue.vAlign === "middle") buckets.middle.push(cue);
		else buckets.bottom.push(cue);
	}

	return buckets;
}

const SubtitleCueItem = memo(function SubtitleCueItem({ cue, styling }: { cue: SubtitleCue; styling: CueStyling }) {
	let alignClass = "text-center";
	if (cue.hAlign === "left") alignClass = "text-left self-start";
	else if (cue.hAlign === "right") alignClass = "text-right self-end";

	return (
		<div
			className={cn(
				"w-fit rounded-md px-24 py-1.5 font-medium font-sans tracking-wide [text-shadow:0_1px_4px_rgb(0_0_0/90%),0_2px_10px_rgb(0_0_0/80%)] [&_b]:font-bold [&_em]:italic [&_i]:italic [&_s]:line-through [&_u]:underline",
				styling.colorClass,
				styling.bgClass,
				alignClass,
			)}
			style={{ fontSize: styling.sizeStyle }}
			// react-doctor-disable-next-line react-doctor/dangerous-html-sink
			/* biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized subtitle markup */ dangerouslySetInnerHTML={{ __html: cue.html }}
		/>
	);
});

export function PlayerSubtitleOverlay({ controlsVisible }: { controlsVisible: boolean }) {
	const { selectedSubtitle, subtitleContent, subtitleSize, subtitlePosition, subtitleColor, subtitleBackground, subtitleOffset } =
		usePlayerSubtitles();
	const { currentTime } = usePlayerTime();

	// Parsing the whole file on every currentTime tick (~4-5x/s) delays cue rendering —
	// cues depend only on the subtitle content, so parse once per selection.
	const cues = useMemo(
		() => (!(selectedSubtitle && subtitleContent) ? [] : parseSubtitles(subtitleContent)),
		[selectedSubtitle, subtitleContent],
	);

	const effectiveTime = currentTime - subtitleOffset;
	const activeCues = useActiveCues(cues, effectiveTime);

	const buckets = splitCuesByPosition(activeCues, subtitlePosition);

	const styling: CueStyling = {
		sizeStyle: SIZE_STYLES[subtitleSize],
		colorClass: COLOR_CLASSES[subtitleColor],
		bgClass: BG_CLASSES[subtitleBackground],
	};

	if (activeCues.length === 0) return null;

	return (
		<div className="pointer-events-none absolute inset-0 z-15 select-none" aria-live="polite" aria-atomic="true">
			{buckets.top.length > 0 && (
				<div className="absolute inset-x-0 top-16 flex flex-col items-center gap-1.5 px-8 transition-opacity duration-200">
					{buckets.top.map((cue) => (
						<SubtitleCueItem key={cue.id} cue={cue} styling={styling} />
					))}
				</div>
			)}

			{buckets.middle.length > 0 && (
				<div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center gap-1.5 px-8">
					{buckets.middle.map((cue) => (
						<SubtitleCueItem key={cue.id} cue={cue} styling={styling} />
					))}
				</div>
			)}

			{buckets.bottom.length > 0 && (
				<div
					className={cn("absolute inset-x-0 flex flex-col items-center gap-1.5 px-8 transition-[bottom] duration-200", {
						"bottom-28": controlsVisible,
						"bottom-16": !controlsVisible,
					})}
				>
					{buckets.bottom.map((cue) => (
						<SubtitleCueItem key={cue.id} cue={cue} styling={styling} />
					))}
				</div>
			)}
		</div>
	);
}
