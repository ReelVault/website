import { describe, expect, it } from "bun:test";
import { overwriteGetLocale } from "@/paraglide/runtime";
import { formatDuration } from "@/utils/duration-utils";
import { formatFileSize } from "@/utils/file-utils";
import {
	formatCountdown,
	formatDate,
	formatDateTime,
	formatNumber,
	formatRating,
	formatTimeAgo,
	formatTimestamp,
	shortDateFormatter,
	shortTimeFormatter,
} from "@/utils/format-utils";

// The assertions below expect English formatting; without this pin the
// preferred-language strategy picks the shell locale (pl-PL → "1,5 KB").
overwriteGetLocale(() => "en");

const THOUSAND_GROUPING_REGEX = /1[,\s\u00a0\u202f]?000/;

describe("formatDuration", () => {
	it("returns em dash for falsy input", () => {
		expect(formatDuration(0)).toBe("—");
		expect(formatDuration(null)).toBe("—");
		expect(formatDuration(undefined)).toBe("—");
	});

	it("formats minutes only below an hour", () => {
		expect(formatDuration(59 * 60 + 59)).toBe("59m");
	});

	it("formats hours and minutes above an hour", () => {
		expect(formatDuration(3600 * 2 + 60 * 5 + 30)).toBe("2h 5m");
	});
});

describe("invalid date handling", () => {
	it("renders an em dash instead of throwing RangeError", () => {
		expect(formatDate("not-a-date")).toBe("—");
		expect(formatDateTime("not-a-date")).toBe("—");
		expect(formatTimeAgo("not-a-date")).toBe("—");
	});

	it("keeps valid dates formatted", () => {
		expect(formatDate("2024-01-15T00:00:00.000Z")).not.toBe("—");
	});

	it("the shared short formatters also survive an invalid date", () => {
		expect(shortDateFormatter.format(new Date("not-a-date"))).toBe("—");
		expect(shortTimeFormatter.format(new Date("not-a-date"))).toBe("—");
	});
});

describe("formatCountdown", () => {
	it("pads single-digit seconds", () => {
		expect(formatCountdown(65)).toBe("1:05");
	});

	it("does not pad minutes", () => {
		expect(formatCountdown(9)).toBe("0:09");
		expect(formatCountdown(600)).toBe("10:00");
	});
});

describe("formatTimestamp", () => {
	it("pads minutes and seconds under an hour", () => {
		expect(formatTimestamp(65.4)).toBe("01:05");
	});

	it("includes hours above one hour", () => {
		expect(formatTimestamp(3600 + 60)).toBe("01:01:00");
	});
});

describe("formatFileSize", () => {
	it("returns 0 Bytes for zero", () => {
		expect(formatFileSize(0)).toBe("0 Bytes");
	});

	it("formats kilobytes with locale decimals", () => {
		expect(formatFileSize(1536)).toBe("1.5 KB");
	});
});

describe("locale-aware formatters", () => {
	it("formatRating handles null and formats decimal", () => {
		expect(formatRating(null)).toBe("—");
		expect(formatRating(undefined)).toBe("—");
		expect(formatRating(8.5)).toBe("8.5");
	});

	it("formatNumber handles null and formats with groupings", () => {
		expect(formatNumber(null)).toBe("—");
		expect(formatNumber(1000)).toMatch(THOUSAND_GROUPING_REGEX);
	});

	it("formatDate and formatDateTime handle null gracefully", () => {
		expect(formatDate(null)).toBe("—");
		expect(formatDateTime(null)).toBe("—");
	});

	it("formatTimeAgo formats recent thresholds in English", () => {
		expect(formatTimeAgo(null)).toBe("—");
		expect(formatTimeAgo(Date.now() - 10 * 1000)).toBe("Just now");
		expect(formatTimeAgo(Date.now() - 5 * 60 * 1000)).toBe("5 min. ago");
		expect(formatTimeAgo(Date.now() - 2 * 60 * 60 * 1000)).toBe("2 hr. ago");
		expect(formatTimeAgo(Date.now() - 24 * 60 * 60 * 1000)).toBe("Yesterday");
		expect(formatTimeAgo(Date.now() - 5 * 24 * 60 * 60 * 1000)).toBe("5 days ago");
	});
});
