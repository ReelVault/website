import { detach } from "@/lib/detach";
import type { Locale } from "@/paraglide/runtime";
import { getLocale, isLocale, setLocale } from "@/paraglide/runtime";

/**
 * Never throws — paraglide's `getLocale()` throws when no strategy resolves,
 * which cannot happen with our strategy chain but keeps call sites safe.
 */
export function getAppLocale(): Locale {
	try {
		return getLocale();
	} catch {
		return "en";
	}
}

/**
 * Switches the app language. Delegates to paraglide's `setLocale`, which
 * persists via the localStorage strategy and performs a full document
 * reload so every translated string re-renders against the new locale.
 */
export function setAppLocale(locale: Locale): void {
	if (!isLocale(locale) || locale === getAppLocale()) return;

	// setLocale may return void or a promise depending on the runtime entry point.
	detach(Promise.resolve(setLocale(locale)));
}
