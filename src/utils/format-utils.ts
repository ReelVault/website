import { m } from "@/paraglide/messages";
import { getAppLocale } from "@/utils/locale";

const numberFormatters = new Map<string, Intl.NumberFormat>();
const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>();
const relativeTimeFormatters = new Map<string, Intl.RelativeTimeFormat>();

export function getLocaleTag(locale: string = getAppLocale()): "pl-PL" | "en-US" {
	return locale === "pl" ? "pl-PL" : "en-US";
}

export function getNumberFormatter(options?: Intl.NumberFormatOptions, locale: string = getAppLocale()): Intl.NumberFormat {
	const key = `${locale}:${JSON.stringify(options ?? {})}`;
	let formatter = numberFormatters.get(key);
	if (!formatter) {
		formatter = new Intl.NumberFormat(getLocaleTag(locale), options);
		numberFormatters.set(key, formatter);
	}

	return formatter;
}

export function getDateTimeFormatter(options?: Intl.DateTimeFormatOptions, locale: string = getAppLocale()): Intl.DateTimeFormat {
	const key = `${locale}:${JSON.stringify(options ?? {})}`;
	let formatter = dateTimeFormatters.get(key);
	if (!formatter) {
		formatter = new Intl.DateTimeFormat(getLocaleTag(locale), options);
		dateTimeFormatters.set(key, formatter);
	}

	return formatter;
}

export function getRelativeTimeFormatter(
	options?: Intl.RelativeTimeFormatOptions,
	locale: string = getAppLocale(),
): Intl.RelativeTimeFormat {
	const key = `${locale}:${JSON.stringify(options ?? {})}`;
	let formatter = relativeTimeFormatters.get(key);
	if (!formatter) {
		formatter = new Intl.RelativeTimeFormat(locale, options);
		relativeTimeFormatters.set(key, formatter);
	}

	return formatter;
}

export const shortTimeFormatter = {
	format(date?: Date | number): string {
		return getDateTimeFormatter({ timeStyle: "medium" }).format(date);
	},
	formatToParts(date?: Date | number): Intl.DateTimeFormatPart[] {
		return getDateTimeFormatter({ timeStyle: "medium" }).formatToParts(date);
	},
};

export const shortDateFormatter = {
	format(date?: Date | number): string {
		return getDateTimeFormatter({ dateStyle: "medium" }).format(date);
	},
	formatToParts(date?: Date | number): Intl.DateTimeFormatPart[] {
		return getDateTimeFormatter({ dateStyle: "medium" }).formatToParts(date);
	},
};

export function formatNumber(value: number | null | undefined, options?: Intl.NumberFormatOptions): string {
	return value == null ? "—" : getNumberFormatter(options).format(value);
}

export function formatRating(value: number | null | undefined): string {
	return value == null ? "—" : getNumberFormatter({ minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);
}

export function formatDate(value: Date | string | number | null | undefined): string {
	return value == null ? "—" : getDateTimeFormatter({ dateStyle: "medium" }).format(new Date(value));
}

export function formatDateTime(value: Date | string | number | null | undefined): string {
	return value == null ? "—" : getDateTimeFormatter({ dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function formatFullDateTime(value: Date | string | number | null | undefined): string {
	return value == null ? "—" : getDateTimeFormatter({ dateStyle: "medium", timeStyle: "medium" }).format(new Date(value));
}

export function formatWeekday(value: Date | string | number | null | undefined): string {
	return value == null ? "—" : getDateTimeFormatter({ weekday: "short" }).format(new Date(value));
}

export function formatTimeAgo(value: Date | string | number | null | undefined): string {
	if (value == null) return "—";

	const diffSeconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
	if (diffSeconds < 60) return m.common_just_new();

	const diffMinutes = Math.floor(diffSeconds / 60);
	if (diffMinutes < 60) {
		return getRelativeTimeFormatter({ numeric: "auto", style: "short" }).format(-diffMinutes, "minute");
	}

	const diffHours = Math.floor(diffMinutes / 60);
	if (diffHours < 24) {
		return getRelativeTimeFormatter({ numeric: "auto", style: "short" }).format(-diffHours, "hour");
	}

	const diffDays = Math.floor(diffHours / 24);
	if (diffDays === 1) {
		const str = getRelativeTimeFormatter({ numeric: "auto", style: "short" }).format(-1, "day");

		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	if (diffDays < 30) {
		return getRelativeTimeFormatter({ numeric: "auto", style: "short" }).format(-diffDays, "day");
	}

	return formatDate(value);
}

export function formatBitrate(bitRate: number | null | undefined): string | null {
	if (!bitRate) return null;

	const mbps = (bitRate / 1000 / 1000).toFixed(1);

	return `${mbps} Mbps`;
}

export function formatAudioChannels(channels: number | null | undefined, layout: string | null | undefined): string {
	if (layout) return layout;

	if (!channels) return "Stereo";

	if (channels === 1) return "Mono";

	if (channels === 2) return "Stereo (2.0)";

	if (channels === 6) return "5.1 Surround";

	if (channels === 8) return "7.1 Surround";

	return `${channels} ch`;
}

export function formatTimestamp(totalSecs: number): string {
	const mins = Math.floor(totalSecs / 60);
	const secs = Math.floor(totalSecs % 60);
	const hrs = Math.floor(mins / 60);
	const remMins = mins % 60;

	if (hrs > 0) {
		return `${hrs.toString().padStart(2, "0")}:${remMins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
	}

	return `${remMins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function formatCountdown(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;

	return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}
