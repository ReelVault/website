import { describe, expect, test } from "bun:test";
import { overwriteGetLocale } from "@/paraglide/runtime";
import { translateByKey, translateCode, translateError } from "../src/utils/translate-error";

// Deterministic locale: without this, the first message call walks the strategy
// chain, which under a DOM-shimmed test run touches window.localStorage.
overwriteGetLocale(() => "en");

/** Codes the v1.3.0 changelog says show their own message; each must translate instead of falling back to the raw code. */
const V13_CODES = [
	"auth.email_registered",
	"auth.invalid_email",
	"auth.request_rejected",
	"auth.user_banned",
	"database.backup_failed",
	"downloads.disabled",
	"downloads.in_progress",
	"downloads.no_media_file",
	"downloads.not_retryable",
	"downloads.queue_full",
	"downloads.quota_exceeded",
	"downloads.season_exceeds_quota",
	"media.probe_failed",
	"plugin.registration_limit.routes",
	"scan_reason_probe_failed",
] as const;

describe("codes named in the v1.3.0 changelog", () => {
	for (const code of V13_CODES) {
		test(`${code} shows its own message`, () => {
			expect(translateByKey(code)).not.toBe(code);
		});
	}

	test("a stream limit names the limit", () => {
		expect(translateByKey("stream.limit_reached", { limit: 3 })).toContain("3");
	});

	test("a throttled session start names the wait", () => {
		expect(translateByKey("stream.creation_throttled", { retryAfterSeconds: 7 })).toContain("7");
	});

	test("a rejected account request says the server rejected it", () => {
		expect(translateByKey("auth.request_rejected")).toBe("The server rejected this request.");
	});

	test("a list query error says what to do: reload the list, or change the sort or the filter", () => {
		expect(translateByKey("validation.invalid_cursor")).toBe("The page cursor is no longer valid. Reload the list.");
		expect(translateByKey("validation.cursor_not_supported")).toBe("This sort order does not support cursor paging.");
		expect(translateByKey("validation.filter_too_many_values", { max: 500 })).toContain("500");
	});
});

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

	test("translates the database backup failure code", () => {
		expect(translateByKey("database.backup_failed")).toContain("backup");
	});

	test("translates the reasons a playback session can end with, and keeps a free-text reason", () => {
		expect(translateByKey("inactivity-timeout")).toContain("inactivity");
		expect(translateByKey("admin.terminated")).toContain("administrator");
		expect(translateByKey("client-release-all")).toContain("remote control");
		expect(translateByKey("maintenance window tonight")).toBe("maintenance window tonight");
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

describe("parameterized server codes", () => {
	test("interpolates the parameters a code carries", () => {
		const translated = translateByKey("plugin.catalog_entry_invalid", { index: 2, field: "homepage" });
		expect(translated).toContain("2");
		expect(translated).toContain("homepage");
	});

	test("falls back to the caller's text when a parameter is missing", () => {
		// A code can arrive without its parameters (a stored plugin error); a sentence with blanks is worse than the fallback.
		expect(translateCode("plugin.catalog_entry_invalid", "fallback")).toBe("fallback");
		expect(translateCode("plugin.catalog_entry_invalid", "fallback", { index: 2 })).toBe("fallback");
	});
});
