import type { ClientCapabilities } from "@reelvault/sdk";
import { useEffect, useState } from "react";
import { detach } from "../utils/player-utils";

interface CodecProbe {
	codec: string;
	mimeTypes: string[];
}

/**
 * `ManagedMediaSource` (Safari 17.1+ on iOS) isn't in lib.dom.d.ts yet.
 * hls.js >= 1.5 uses it internally when plain `MediaSource` isn't usable
 * for video, which is why `Hls.isSupported()` alone is enough to know
 * whether the hls.js pipeline is viable on this client.
 */
interface ManagedMediaSourceConstructor {
	isTypeSupported(type: string): boolean;
}

declare global {
	interface Window {
		ManagedMediaSource?: ManagedMediaSourceConstructor;
	}
}

/**
 * Video codec probes via MSE (fMP4 path).
 *
 * Each entry lists the MIME types used to probe `MediaSource.isTypeSupported()`.
 * Multiple MIME types per codec handle browser-specific profile quirks — a codec
 * is considered supported if ANY of its MIME types pass.
 *
 * Codec identifiers mirror the server's VIDEO_CODEC_MAP canonical keys so that
 * the direct-stream vs. transcode decision is accurate.
 */
const VIDEO_CODEC_PROBES: CodecProbe[] = [
	// H.264 / AVC — universally supported
	{ codec: "h264", mimeTypes: ['video/mp4; codecs="avc1.42E01E"'] },
	// H.265 / HEVC — availability is platform/OS-dependent, not just browser-version:
	// macOS (Safari/Chrome/Edge/Firefox): native via VideoToolbox, no extras needed.
	// Windows Chrome 107+/Edge 107+: needs a GPU with HW HEVC decode (Intel Skylake+,
	//   NVIDIA Maxwell 2nd gen+, AMD Fiji+); Edge additionally requires the paid
	//   Microsoft "HEVC Video Extensions" add-on — no software fallback either way.
	// Windows Firefox 134+ / macOS Firefox 136+ / Linux+Android Firefox 137+:
	//   same extension dependency as Edge.
	// Linux: essentially unsupported outside best-effort VAAPI in Chrome.
	// CAVEAT: isTypeSupported() can false-positive here (known Firefox/Windows
	// issue — reports "supported" even without the codec pack installed, then
	// fails on actual append). Treat a `true` from this probe as "likely OK",
	// not "guaranteed OK" — see the caveat in playback-decision.ts too.
	{
		codec: "h265",
		mimeTypes: [
			'video/mp4; codecs="hvc1.1.6.L93.B0"',
			'video/mp4; codecs="hev1.1.6.L93.B0"',
			// Unparameterised form accepted by some Chromium builds
			'video/mp4; codecs="hvc1"',
		],
	},
	// H.265 Main10 (10-bit, profile_idc 2) — separate probe: many clients that
	// decode 8-bit HEVC in software still hardware-decode Main10 (and vice versa),
	// so the server must not infer one from the other.
	{
		codec: "h265-10bit",
		mimeTypes: ['video/mp4; codecs="hvc1.2.4.L153.B0"', 'video/mp4; codecs="hvc1.2.4.L123.B0"', 'video/mp4; codecs="hev1.2.4.L153.B0"'],
	},
	// AV1 — Chrome 70+, Firefox 67+, Edge 79+, Safari 16.4+
	{
		codec: "av1",
		mimeTypes: [
			'video/mp4; codecs="av01.0.05M.08"',
			// Baseline profile level 0 — widest compatibility check
			'video/mp4; codecs="av01.0.00M.08"',
		],
	},
	// VP9 — Chrome 29+, Firefox 28+, Edge 14+ (fMP4 and WebM containers)
	{
		codec: "vp9",
		mimeTypes: ['video/mp4; codecs="vp09.00.10.08"', 'video/webm; codecs="vp9"'],
	},
	// VP9 profile 2 (10-bit) — separate probe, same rationale as h265-10bit.
	{
		codec: "vp9-10bit",
		mimeTypes: ['video/mp4; codecs="vp09.02.50.10"', 'video/webm; codecs="vp9.2"'],
	},
	// VP8 — Chrome, Firefox, Edge (WebM only; rarely used in modern content)
	{ codec: "vp8", mimeTypes: ['video/webm; codecs="vp8"'] },
	// MPEG-4 Visual / DivX / XviD — legacy; probed so old files direct-stream when possible
	{ codec: "mpeg4", mimeTypes: ['video/mp4; codecs="mp4v.20.8"'] },
];

/**
 * Audio codec probes via MSE (fMP4 / WebM path).
 *
 * The server delivers all audio inside fMP4 HLS segments, so every probe
 * targets `MediaSource`/`ManagedMediaSource` first — the same pipeline
 * hls.js appends to.
 *
 * Codec identifiers mirror the server's AUDIO_CODEC_MAP canonical keys.
 */
const AUDIO_CODEC_PROBES: CodecProbe[] = [
	// AAC — universally supported
	{ codec: "aac", mimeTypes: ['audio/mp4; codecs="mp4a.40.2"'] },
	// MP3 — universally supported (bare MPEG stream and fMP4 encapsulation)
	{ codec: "mp3", mimeTypes: ["audio/mpeg", 'audio/mp4; codecs="mp4a.69"'] },
	// Opus — fMP4: Chromium 33+, Edge 79+; WebM: Chrome, Firefox, Edge
	{ codec: "opus", mimeTypes: ['audio/mp4; codecs="opus"', 'audio/webm; codecs="opus"'] },
	// Vorbis — Firefox, Chrome, Edge (WebM container only)
	{ codec: "vorbis", mimeTypes: ['audio/webm; codecs="vorbis"'] },
	// AC-3 / Dolby Digital — Safari on macOS/iOS, Chrome 123+ on macOS
	// NOTE: The ISO codec identifier is "ac-3" (with hyphen), NOT "ac3".
	// Some browsers only report support when combined with a video codec.
	{
		codec: "ac3",
		mimeTypes: ['audio/mp4; codecs="ac-3"', 'video/mp4; codecs="avc1.42E01E, ac-3"'],
	},
	// E-AC-3 / Dolby Digital Plus — Safari on macOS/iOS, Chrome 123+ on macOS
	// NOTE: The ISO codec identifier is "ec-3" (with hyphen), NOT "eac3".
	{
		codec: "eac3",
		mimeTypes: ['audio/mp4; codecs="ec-3"', 'video/mp4; codecs="avc1.42E01E, ec-3"'],
	},
	// FLAC in fMP4 — Chrome 56+, Firefox 51+, Edge 16+
	{ codec: "flac", mimeTypes: ['audio/mp4; codecs="flac"'] },
	// ALAC (Apple Lossless) in fMP4 — Safari
	{ codec: "alac", mimeTypes: ['audio/mp4; codecs="alac"'] },
];

/**
 * Probes whether a given MIME type can be appended to a SourceBuffer,
 * via whichever MSE variant hls.js will actually use:
 *
 * 1. `MediaSource.isTypeSupported()` — standard MSE (Chrome, Firefox, Edge, Safari desktop).
 * 2. `ManagedMediaSource.isTypeSupported()` — iOS Safari 17.1+, since
 *    plain `MediaSource` isn't usable for video there even when the
 *    global happens to exist.
 *
 * Falls back to `canPlayType` only when neither MSE variant is available
 * (e.g. very old browsers) — the least reliable signal but better than nothing.
 */
function supportsCodec(mimeType: string): boolean {
	if (typeof MediaSource !== "undefined" && MediaSource.isTypeSupported(mimeType)) return true;

	if (window.ManagedMediaSource?.isTypeSupported(mimeType)) return true;

	// MSE unavailable — native HLS player; canPlayType is the best available signal
	const probe = document.createElement("video");

	return probe.canPlayType(mimeType) !== "";
}

/**
 * HDR render-path probes via `MediaCapabilities.decodingInfo` — the only API
 * that carries the transfer function; `isTypeSupported` cannot distinguish an
 * SDR from an HDR-capable pipeline. Each probe uses HEVC Main10 (the HDR
 * carrier in practice); a supported result means the client renders that
 * transfer as-is, so the server may passthrough instead of tone-mapping.
 */
interface HdrProbe {
	transfer: "smpte2084" | "arib-std-b67";
	transferFunction: "pq" | "hlg";
}

const HDR_PROBES: HdrProbe[] = [
	{ transfer: "smpte2084", transferFunction: "pq" },
	{ transfer: "arib-std-b67", transferFunction: "hlg" },
];

const HDR_PROBE_TIMEOUT_MS = 2_000;

async function probeHdrTransfers(): Promise<string[]> {
	if (typeof navigator === "undefined" || !("mediaCapabilities" in navigator)) return [];

	const mediaCapabilities = navigator.mediaCapabilities;
	const probe = async (candidate: HdrProbe): Promise<string[]> => {
		try {
			const support = await mediaCapabilities.decodingInfo({
				type: "file",
				video: {
					contentType: 'video/mp4; codecs="hvc1.2.4.L153.B0"',
					width: 1920,
					height: 1080,
					bitrate: 10_000_000,
					framerate: 30,
					transferFunction: candidate.transferFunction,
				},
			});

			return support.supported ? [candidate.transfer] : [];
		} catch {
			return [];
		}
	};
	const withTimeout = Promise.race([
		Promise.all(HDR_PROBES.map((candidate) => probe(candidate))),
		new Promise<string[][]>((resolve) => {
			setTimeout(() => resolve([]), HDR_PROBE_TIMEOUT_MS);
		}),
	]);

	return (await withTimeout).flat();
}

/**
 * Detects codecs supported by the complete HLS playback pipeline.
 *
 * The server emits fMP4 HLS segments, so every probe goes through
 * `MediaSource` or `ManagedMediaSource` — the same MSE path hls.js uses.
 * A codec is advertised only when the browser can actually append it
 * to a SourceBuffer, preventing false positives from `canPlayType`.
 *
 * Returns `undefined` on the first render (SSR-safe) and resolves to
 * the detected `ClientCapabilities` on the client after mount.
 */
export function useClientCapabilities(): ClientCapabilities | undefined {
	const [capabilities, setCapabilities] = useState<ClientCapabilities>();

	useEffect(() => {
		let cancelled = false;
		// One async resolution (HDR probes included) BEFORE the first state set —
		// a late-arriving hdrTransfers field would change the session request
		// shape and force a needless session restart.
		const compute = async () => {
			const hdrTransfers = await probeHdrTransfers();
			if (cancelled) return;

			setCapabilities({
				videoCodecs: VIDEO_CODEC_PROBES.flatMap(({ mimeTypes, codec }) =>
					mimeTypes.some((mimeType) => supportsCodec(mimeType)) ? [codec] : [],
				),
				audioCodecs: AUDIO_CODEC_PROBES.flatMap(({ mimeTypes, codec }) =>
					mimeTypes.some((mimeType) => supportsCodec(mimeType)) ? [codec] : [],
				),
				...(hdrTransfers.length > 0 ? { hdrTransfers } : {}),
			});
		};

		detach(compute);

		return () => {
			cancelled = true;
		};
	}, []);

	return capabilities;
}
