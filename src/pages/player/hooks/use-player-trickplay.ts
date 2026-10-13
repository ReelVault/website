import { useQuery } from "@tanstack/react-query";
import { getReelVaultApiUrl, reelvault } from "@/client/client";
import { mediaKeys } from "@/client/utils/query-keys";

export interface TrickplayCue {
	startTime: number;
	endTime: number;
	url: string;
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface TrickplayFrame {
	found: boolean;
	url?: string;
	x?: number;
	y?: number;
	width?: number;
	height?: number;
}

function parseVttTimestamp(timestamp: string): number | null {
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

const CRLF_REGEX = /\r\n/g;
const CR_REGEX = /\r/g;
const DOUBLE_NEWLINE_SPLIT_REGEX = /\n\n+/;
const TRAILING_SLASH_REGEX = /\/$/;

/** Parses one WebVTT block into a cue; returns null for blocks that are not cues (header, notes, malformed timing). */
function parseCueBlock(block: string, baseApiUrl: string): TrickplayCue | null {
	const trimmed = block.trim();
	if (!trimmed || trimmed.startsWith("WEBVTT")) return null;

	const lines = trimmed.split("\n");
	const timeLineIndex = lines.findIndex((line) => line.includes("-->"));
	const timeLine = timeLineIndex === -1 ? undefined : lines[timeLineIndex];
	if (!timeLine) return null;

	const [startStr, endStr] = timeLine.split("-->").map((s) => s.trim().split(" ")[0]);
	if (!(startStr && endStr)) return null;

	const startTime = parseVttTimestamp(startStr);
	const endTime = parseVttTimestamp(endStr);
	if (startTime === null || endTime === null) return null;

	// Payload line: e.g. /v1/media-files/xyz/artifacts/abc#xywh=0,0,160,90
	const payloadLine = lines
		.slice(timeLineIndex + 1)
		.join(" ")
		.trim();
	if (!payloadLine) return null;

	const hashIndex = payloadLine.indexOf("#xywh=");
	const rawUrl = hashIndex === -1 ? payloadLine : payloadLine.slice(0, hashIndex);
	const url =
		rawUrl.startsWith("http://") || rawUrl.startsWith("https://") ? rawUrl : `${baseApiUrl}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;

	// Without #xywh the cue is a single frame image, so it gets the default thumbnail rectangle.
	if (hashIndex === -1) return { startTime, endTime, url, x: 0, y: 0, width: 160, height: 90 };

	const [xStr, yStr, wStr, hStr] = payloadLine.slice(hashIndex + 6).split(",");

	return {
		startTime,
		endTime,
		url,
		x: Number.parseInt(xStr ?? "0", 10) || 0,
		y: Number.parseInt(yStr ?? "0", 10) || 0,
		width: Number.parseInt(wStr ?? "160", 10) || 160,
		height: Number.parseInt(hStr ?? "90", 10) || 90,
	};
}

export function parseTrickplayVtt(vttContent: string): TrickplayCue[] {
	if (!vttContent || typeof vttContent !== "string") return [];

	const normalized = vttContent.replace(CRLF_REGEX, "\n").replace(CR_REGEX, "\n");
	const blocks = normalized.split(DOUBLE_NEWLINE_SPLIT_REGEX);
	const baseApiUrl = getReelVaultApiUrl().replace(TRAILING_SLASH_REGEX, "");

	const cues: TrickplayCue[] = [];
	for (const block of blocks) {
		const cue = parseCueBlock(block, baseApiUrl);
		if (cue) cues.push(cue);
	}

	return cues;
}

export function usePlayerTrickplay(mediaFileId?: string, options?: { enabled?: boolean }) {
	const enabled = options?.enabled !== false;

	// 1. Fetch artifacts list
	const artifactsQuery = useQuery({
		queryKey: mediaKeys.artifacts(mediaFileId),
		queryFn: async () => {
			if (!mediaFileId) return [];

			return await reelvault.media.getArtifacts(mediaFileId);
		},
		enabled: enabled && Boolean(mediaFileId),
		staleTime: 5 * 60 * 1000,
	});

	const trickplayVttArtifact = artifactsQuery.data?.find(
		(a) => a.kind === "trickplay" && (a.contentType.includes("vtt") || a.url.endsWith(".vtt")),
	);

	// 2. Fetch VTT content if available
	const vttContentQuery = useQuery({
		queryKey: mediaKeys.artifactContent(mediaFileId, trickplayVttArtifact?.id),
		queryFn: async () => {
			if (!(mediaFileId && trickplayVttArtifact)) return null;

			const res = await reelvault.media.getArtifact(mediaFileId, trickplayVttArtifact.id);
			if (typeof res === "string") return res;

			if (res instanceof Blob) return await res.text();

			return String(res);
		},
		select: (data) => (data ? parseTrickplayVtt(data) : []),
		enabled: enabled && Boolean(mediaFileId && trickplayVttArtifact),
		staleTime: Number.POSITIVE_INFINITY,
	});

	const cues = vttContentQuery.data ?? [];

	const getThumbnailAt = (timeSeconds: number): TrickplayFrame => {
		if (cues.length === 0) return { found: false };

		let low = 0;
		let high = cues.length - 1;
		while (low <= high) {
			const mid = (low + high) >> 1;
			const cue = cues[mid];
			if (!cue) break;

			if (timeSeconds < cue.startTime) {
				high = mid - 1;
			} else if (timeSeconds >= cue.endTime) {
				low = mid + 1;
			} else {
				return {
					found: true,
					url: cue.url,
					x: cue.x,
					y: cue.y,
					width: cue.width,
					height: cue.height,
				};
			}
		}

		return { found: false };
	};

	return {
		hasTrickplay: cues.length > 0,
		getThumbnailAt,
	};
}
