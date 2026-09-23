import { describe, expect, test } from "bun:test";
import { EMBED_ALLOW, embedReferrerPolicy, embedSandbox } from "@/plugin-host/embed-policy";

describe("embed policy", () => {
	test("grants a real origin to known video players", () => {
		expect(embedSandbox("https://www.youtube-nocookie.com/embed/abc?autoplay=1")).toContain("allow-same-origin");
		expect(embedSandbox("https://www.youtube.com/embed/abc")).toContain("allow-same-origin");
		expect(embedSandbox("https://player.vimeo.com/video/123")).toContain("allow-same-origin");
	});

	test("keeps an opaque origin for arbitrary plugin-supplied pages", () => {
		expect(embedSandbox("https://evil.example/embed")).not.toContain("allow-same-origin");
		// Relative/unknown hosts resolve against the fixed base and stay strict.
		expect(embedSandbox("/embed/abc")).not.toContain("allow-same-origin");
		expect(embedSandbox("not a url")).not.toContain("allow-same-origin");
	});

	test("always keeps the player capabilities without the legacy allowFullScreen", () => {
		expect(EMBED_ALLOW).toContain("autoplay");
		expect(EMBED_ALLOW).toContain("fullscreen");
	});

	test("sends a referrer to video players only (YouTube Error 153)", () => {
		expect(embedReferrerPolicy("https://www.youtube-nocookie.com/embed/abc")).toBe("strict-origin-when-cross-origin");
		expect(embedReferrerPolicy("https://evil.example/embed")).toBe("no-referrer");
	});
});
