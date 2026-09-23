/**
 * Renders the server's structured playback-decision reasons (`session.reasons`)
 * as readable Polish diagnostics. The server only sends `code` + `params`; the
 * wording lives here.
 */
import { m } from "@/paraglide/messages";

interface ReasonPart {
	code: string;
	params?: Record<string, string | number | boolean | null>;
}

export interface TranscodeReasons {
	video: ReasonPart;
	audio: ReasonPart;
}

const CODEC_LABELS: Record<string, string> = {
	h264: "H.264",
	h265: "H.265 (HEVC)",
	hevc: "H.265 (HEVC)",
	av1: "AV1",
	vp9: "VP9",
	vp8: "VP8",
	mpeg4: "MPEG-4",
	aac: "AAC",
	ac3: "AC-3",
	eac3: "E-AC-3",
	dts: "DTS",
	truehd: "TrueHD",
	flac: "FLAC",
	mp3: "MP3",
	opus: "Opus",
	vorbis: "Vorbis",
};

function codecLabel(codec: string | null | undefined): string {
	if (!codec) return m.player_reason_unknown_codec();

	return CODEC_LABELS[codec.toLowerCase()] ?? codec.toUpperCase();
}

function getDepthClause(bitDepth: string): string {
	switch (bitDepth) {
		case "10-bit":
			return m.player_10bit_not_supported();
		case "12-bit":
			return m.player_12bit_not_supported();
		case "High10":
			return m.player_h264_high10_unsupported();
		default:
			return m.player_reason_unsupported_bit_depth({ bitDepth });
	}
}

function hdrLabel(raw: string | null | undefined): string {
	if (!raw) return "HDR";

	if (raw === "HDR10" || raw === "HLG") return raw;

	return m.player_transcode_reason_dolby_vision({ profile: raw });
}

function videoText(part: ReasonPart): string {
	const params = part.params ?? {};
	const codec = codecLabel(typeof params.codec === "string" ? params.codec : null);
	const bitDepth = typeof params.bitDepth === "string" ? params.bitDepth : null;
	const bitrateKbps = typeof params.bitrateKbps === "number" ? params.bitrateKbps : null;

	let base: string;
	if (part.code === "video.copy") {
		base = m.reason_video_copy({ codec });
	} else if (part.code === "video.copy_hdr") {
		base = m.reason_video_copy_hdr({ codec, hdr: hdrLabel(typeof params.hdr === "string" ? params.hdr : null) });
	} else if (part.code === "video.transcode_hdr") {
		base = m.reason_video_transcode_hdr({ codec, hdr: hdrLabel(typeof params.hdr === "string" ? params.hdr : null) });
	} else {
		base = m.reason_video_transcode({ codec });
	}

	const clauses: string[] = [];
	if (bitDepth) clauses.push(getDepthClause(bitDepth));

	if (bitrateKbps) clauses.push(m.player_reason_with_bitrate_limit({ bitrateKbps }));

	return [base, clauses.join(", ")].filter(Boolean).join(" — ");
}

function audioText(part: ReasonPart): string {
	const params = part.params ?? {};
	const codec = codecLabel(typeof params.codec === "string" ? params.codec : null);

	return part.code === "audio.transcode" ? m.reason_audio_transcode({ codec }) : m.reason_audio_copy({ codec });
}

export function formatTranscodeReasons(reasons: TranscodeReasons | null | undefined): string {
	if (!reasons) return "";

	return [videoText(reasons.video), audioText(reasons.audio)].filter(Boolean).join("; ");
}
