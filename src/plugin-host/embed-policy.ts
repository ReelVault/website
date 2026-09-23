/**
 * Shared iframe policy for plugin-supplied embeds (schema `embed` nodes and the
 * cinemamode pre-roll overlay).
 *
 * Arbitrary remote pages get an opaque origin (`allow-same-origin` omitted): the
 * embed `src` comes from an installable plugin, so it must not share the host's
 * origin, window or storage. Known video players (YouTube, Vimeo) are the
 * exception — their player scripts need a real origin and throw without it
 * ("Cache storage is disabled because the context is sandboxed", `writeEmbed is
 * not defined`), leaving a blank embed. Grant that capability only to those
 * hosts.
 */
const VIDEO_EMBED_HOSTS: ReadonlySet<string> = new Set([
	"youtube.com",
	"www.youtube.com",
	"m.youtube.com",
	"youtube-nocookie.com",
	"www.youtube-nocookie.com",
	"vimeo.com",
	"player.vimeo.com",
]);

const BASE_SANDBOX = "allow-scripts allow-presentation allow-popups allow-popups-to-escape-sandbox allow-forms";

/** Fixed base so the helper stays pure; relative `src`s resolve to it and never match the allowlist. */
const URL_BASE = "https://embed.invalid";

/**
 * The iframe `allow` list. Fullscreen is covered by the `fullscreen` token, so
 * the legacy `allowFullScreen` boolean is intentionally NOT set — React warns
 * that "allow will take precedence over 'allowfullscreen'" when both are.
 */
export const EMBED_ALLOW = "autoplay; encrypted-media; picture-in-picture; fullscreen";

function isVideoEmbedHost(src: string): boolean {
	try {
		return VIDEO_EMBED_HOSTS.has(new URL(src, URL_BASE).hostname);
	} catch {
		// Malformed URL — treat as a generic embed.
		return false;
	}
}

export function embedSandbox(src: string): string {
	return isVideoEmbedHost(src) ? `${BASE_SANDBOX} allow-same-origin` : BASE_SANDBOX;
}

/**
 * Referrer policy for the iframe. YouTube refuses to play without an HTTP
 * `Referer` header (Error 153 — "Video player configuration error"), so video
 * players get the browser default origin-only policy. Arbitrary embeds keep
 * `no-referrer`.
 */
export function embedReferrerPolicy(src: string): "no-referrer" | "strict-origin-when-cross-origin" {
	return isVideoEmbedHost(src) ? "strict-origin-when-cross-origin" : "no-referrer";
}
