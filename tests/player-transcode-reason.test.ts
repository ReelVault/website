import { describe, expect, test } from "bun:test";
import { formatTranscodeReasons } from "@/pages/player/utils/player-transcode-reason";
import { overwriteGetLocale } from "@/paraglide/runtime";

// Deterministic locale for the message lookups below.
overwriteGetLocale(() => "en");

const copiedAudio = { code: "audio.copy", params: { codec: "aac" } };

/**
 * An HDR video that is re-encoded says whether the server tone-mapped it. Without a tone-mapping filter
 * on the server the text must not claim tone-mapping, because the picture is not tone-mapped.
 */
describe("HDR transcode reason", () => {
	test("a tone-mapped HDR transcode says the picture is tone-mapped to SDR", () => {
		const text = formatTranscodeReasons({
			video: { code: "video.transcode_hdr", params: { codec: "hevc", hdr: "HDR10", toneMapped: true } },
			audio: copiedAudio,
		});

		expect(text).toContain("tonemapped to SDR");
	});

	test("without a tone-mapping filter the text says tone-mapping is not applied", () => {
		const text = formatTranscodeReasons({
			video: { code: "video.transcode_hdr", params: { codec: "hevc", hdr: "HDR10", toneMapped: false } },
			audio: copiedAudio,
		});

		expect(text).toContain("without tone-mapping");
		expect(text).not.toContain("tonemapped to SDR");
	});
});
