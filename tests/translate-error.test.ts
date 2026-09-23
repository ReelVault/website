import { describe, expect, test } from "bun:test";
import { overwriteGetLocale } from "@/paraglide/runtime";
import { translateByKey, translateError } from "../src/utils/translate-error";

// Deterministic locale: without this, the first message call walks the strategy
// chain, which under a DOM-shimmed test run touches window.localStorage.
overwriteGetLocale(() => "en");

describe("translateByKey", () => {
	test("translates a known server error code (dots normalized to underscores)", () => {
		const translated = translateByKey("profile.pin_invalid");
		expect(translated).not.toBe("profile.pin_invalid");
		expect(translated.toLowerCase()).toContain("pin");
	});

	test("translates bare category fallback codes", () => {
		expect(translateByKey("not_found")).not.toBe("not_found");
		expect(translateByKey("validation")).not.toBe("validation");
	});

	test("translates media audit reason codes", () => {
		expect(translateByKey("year_mismatch")).not.toBe("year_mismatch");
		expect(translateByKey("sequel_mismatch")).not.toBe("sequel_mismatch");
	});

	test("translates live-activity warning codes", () => {
		// Regression: these arrive as warning `code`s from the server and used to
		// render literally ("admin.live_active_streams") because the catalog index
		// had no entry for them.
		expect(translateByKey("admin.live_active_streams", { viewers: "Alice" })).toContain("Alice");
		expect(translateByKey("admin.live_no_streams")).not.toBe("admin.live_no_streams");
	});

	test("returns raw code for codes outside the dynamic subset", () => {
		expect(translateByKey("totally_unknown_code")).toBe("totally_unknown_code");
	});

	test("is stable for empty and dotted unknown codes", () => {
		expect(translateByKey("")).toBe("");
		expect(translateByKey("a.b.c")).toBe("a.b.c");
	});
});

describe("translateError", () => {
	test("prefers catalog translation over Error.message", () => {
		const error = Object.assign(new Error("HTTP 403: Forbidden"), { code: "profile.pin_invalid" });
		const message = translateError(error, "fallback");
		expect(message).not.toBe("fallback");
		expect(message.toLowerCase()).toContain("pin");
	});

	test("falls back to raw code message when code is unknown", () => {
		const error = Object.assign(new Error("HTTP 418: Teapot"), { code: "teapot.brewing_failed" });
		expect(translateError(error, "fallback")).toBe("HTTP 418: Teapot");
	});

	test("falls back to Error.message when no code", () => {
		expect(translateError(new Error("boom"), "fallback")).toBe("boom");
	});

	test("returns fallback for non-error values", () => {
		expect(translateError(null, "fallback")).toBe("fallback");
		expect(translateError("string error", "fallback")).toBe("fallback");
	});
});
