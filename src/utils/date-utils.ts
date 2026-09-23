import { getAppLocale } from "@/utils/locale";

export function getYearFromDate(date: string | null | undefined) {
	if (!date) return "N/A";

	return new Date(date).getFullYear();
}

const monthFormatters = new Map<string, Intl.DateTimeFormat>();
const weekdayFormatters = new Map<string, Intl.DateTimeFormat>();

/** Long month name for a 0-based month index, in the active app locale. */
export function formatMonthName(monthIndex: number): string {
	const locale = getAppLocale();
	let formatter = monthFormatters.get(locale);
	if (!formatter) {
		formatter = new Intl.DateTimeFormat(locale, { month: "long" });
		monthFormatters.set(locale, formatter);
	}

	return formatter.format(new Date(2000, monthIndex, 1));
}

/** Long weekday name for a 0-based index where 0 = Sunday, in the active app locale. */
export function formatWeekdayName(dayOfWeek: number): string {
	const locale = getAppLocale();
	let formatter = weekdayFormatters.get(locale);
	if (!formatter) {
		formatter = new Intl.DateTimeFormat(locale, { weekday: "long" });
		weekdayFormatters.set(locale, formatter);
	}

	// 2000-01-02 was a Sunday.
	return formatter.format(new Date(2000, 0, 2 + dayOfWeek));
}
