import type { MediaFile, MediaFileWithRelation, PlaybackSession } from "@reelvault/sdk";

/**
 * Single source of truth for the media file shape the player needs.
 * Previously duplicated in both `app-player.tsx` and `use-player-controller.hook.ts`.
 */
export type PlayerMediaFile = Pick<MediaFile, "metadataId" | "duration" | "episodeId"> & Pick<MediaFileWithRelation, "audioStreams">;

export interface CurrentEpisodeInfo {
	episodeId: string;
	seasonNumber: number;
	episodeNumber: number;
	title: string | null;
}

export interface NextEpisodeInfo {
	episodeId: string;
	seasonNumber: number;
	episodeNumber: number;
	title: string | null;
	mediaFileId: string;
}

export type AudioStream = MediaFileWithRelation["audioStreams"][number];

export type PlayerSession = PlaybackSession;

/**
 * User-controlled playback settings, grouped so they travel as one unit
 * (page -> AppPlayer -> PlayerProvider) instead of loose props each.
 */
export interface PlaybackSettings {
	maxBitrate?: number;
	audioStreamIndex?: number;
}

export interface PlaybackSettingsActions {
	onQualityChange: (maxBitrate?: number) => void;
	onAudioStreamChange: (audioStreamIndex?: number) => void;
}

export interface SubtitleOption {
	id: string;
	label?: string | null;
	language: string;
	type?: "embedded" | "external";
	format?: string;
	isDefault?: boolean;
	isForced?: boolean;
}

export interface SubtitleCandidate {
	providerId: string;
	id: string;
	label?: string | null;
	language: string;
	format: string;
}

export type SubtitleSize = "small" | "normal" | "large" | "extra-large";

export type SubtitlePosition = "bottom" | "top" | "middle";

export type SubtitleColor = "white" | "yellow" | "cyan" | "green";

export type SubtitleBackground = "none" | "semi" | "solid";

export interface SubtitlePreferences {
	subtitleSize: SubtitleSize;
	subtitlePosition: SubtitlePosition;
	subtitleColor: SubtitleColor;
	subtitleBackground: SubtitleBackground;
}

export type CaptionFormat = "vtt" | "srt" | "ssa" | "ass";

const BITMAP_SUBTITLE_FORMATS = new Set([
	"hdmv_pgs_subtitle",
	"pgssub",
	"pgs",
	"dvd_subtitle",
	"dvdsub",
	"vobsub",
	"xsub",
	"dvb_subtitle",
	"dvb_teletext",
	"arib_caption",
]);

const LEADING_DOT_REGEX = /^\./;

export function isBitmapSubtitle(format?: string | null): boolean {
	if (!format) return false;

	return BITMAP_SUBTITLE_FORMATS.has(format.toLowerCase().trim().replace(LEADING_DOT_REGEX, ""));
}

const FORMAT_MAP: Record<string, CaptionFormat> = {
	vtt: "vtt",
	webvtt: "vtt",
	srt: "srt",
	subrip: "vtt",
	ass: "ass",
	ssa: "ssa",
	mov_text: "vtt",
	text: "vtt",
};

export function toCaptionFormat(format?: string): CaptionFormat | undefined {
	if (!format || isBitmapSubtitle(format)) return undefined;

	const normalized = format.toLowerCase().trim().replace(LEADING_DOT_REGEX, "");

	return FORMAT_MAP[normalized] ?? "vtt";
}
