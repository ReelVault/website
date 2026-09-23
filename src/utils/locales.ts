import { type FlagComponent, PL, US } from "country-flag-icons/react/3x2";
import type { Locale } from "@/paraglide/runtime";
import { locales } from "@/paraglide/runtime";

/**
 * Central registry for the languages the app knows about.
 *
 * There are two independent lists:
 *  - `SUPPORTED_LOCALES` — the languages the **interface** is translated into
 *    (driven by Paraglide).
 *  - `CONTENT_LANGUAGES` — the languages offered for **audio/subtitles**. This
 *    is deliberately separate: you may want to watch in a language the interface
 *    is not translated into.
 *
 * To add a language, see the "Adding a language" section in the repo README.
 */

export interface SupportedLocale {
	code: Locale;
	/** Endonym: the language's name in its own language (does not depend on the UI locale). */
	label: string;
	icon: FlagComponent;
}

/**
 * Metadata for every locale configured in `project.inlang/settings.json`.
 *
 * Typing this as `Record<Locale, …>` makes TypeScript fail the moment a new
 * locale is added to Paraglide but not here — so you cannot forget a label.
 */
const LOCALE_META: Record<Locale, Omit<SupportedLocale, "code">> = {
	en: { label: "English", icon: US },
	pl: { label: "Polski", icon: PL },
};

/** UI languages, in Paraglide's configured order. */
export const SUPPORTED_LOCALES: SupportedLocale[] = locales.map((code) => ({ code, ...LOCALE_META[code] }));

/** `[value, label]` tuples for `PreferenceSelect`. */
export const uiLocaleOptions = (): string[][] => SUPPORTED_LOCALES.map((locale) => [locale.code, locale.label]);

export interface ContentLanguage {
	value: string;
	label: string;
}

/** Every two-letter language code ISO 639-1 defines. */
const CONTENT_LANGUAGE_CODES: readonly string[] = [
	"aa",
	"ab",
	"ae",
	"af",
	"ak",
	"am",
	"an",
	"ar",
	"as",
	"av",
	"ay",
	"az",
	"ba",
	"be",
	"bg",
	"bh",
	"bi",
	"bm",
	"bn",
	"bo",
	"br",
	"bs",
	"ca",
	"ce",
	"ch",
	"co",
	"cr",
	"cs",
	"cu",
	"cv",
	"cy",
	"da",
	"de",
	"dv",
	"dz",
	"ee",
	"el",
	"en",
	"eo",
	"es",
	"et",
	"eu",
	"fa",
	"ff",
	"fi",
	"fj",
	"fo",
	"fr",
	"fy",
	"ga",
	"gd",
	"gl",
	"gn",
	"gu",
	"gv",
	"ha",
	"he",
	"hi",
	"ho",
	"hr",
	"ht",
	"hu",
	"hy",
	"hz",
	"ia",
	"id",
	"ie",
	"ig",
	"ii",
	"ik",
	"io",
	"is",
	"it",
	"iu",
	"ja",
	"jv",
	"ka",
	"kg",
	"ki",
	"kj",
	"kk",
	"kl",
	"km",
	"kn",
	"ko",
	"kr",
	"ks",
	"ku",
	"kv",
	"kw",
	"ky",
	"la",
	"lb",
	"lg",
	"li",
	"ln",
	"lo",
	"lt",
	"lu",
	"lv",
	"mg",
	"mh",
	"mi",
	"mk",
	"ml",
	"mn",
	"mr",
	"ms",
	"mt",
	"my",
	"na",
	"nb",
	"nd",
	"ne",
	"ng",
	"nl",
	"nn",
	"no",
	"nr",
	"nv",
	"ny",
	"oc",
	"oj",
	"om",
	"or",
	"os",
	"pa",
	"pi",
	"pl",
	"ps",
	"pt",
	"qu",
	"rm",
	"rn",
	"ro",
	"ru",
	"rw",
	"sa",
	"sc",
	"sd",
	"se",
	"sg",
	"si",
	"sk",
	"sl",
	"sm",
	"sn",
	"so",
	"sq",
	"sr",
	"ss",
	"st",
	"su",
	"sv",
	"sw",
	"ta",
	"te",
	"tg",
	"th",
	"ti",
	"tk",
	"tl",
	"tn",
	"to",
	"tr",
	"ts",
	"tt",
	"tw",
	"ty",
	"ug",
	"uk",
	"ur",
	"uz",
	"ve",
	"vi",
	"vo",
	"wa",
	"wo",
	"xh",
	"yi",
	"yo",
	"za",
	"zh",
	"zu",
];

const graphemeSegmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

/** Capitalizes the first grapheme without locale-sensitive casing (Türkçe's İ etc. stay intact). */
const capitalizeEndonym = (label: string): string => {
	const segments = [...graphemeSegmenter.segment(label)];
	const first = segments[0];

	return first === undefined
		? label
		: first.segment.toUpperCase() +
				segments
					.slice(1)
					.map((segment) => segment.segment)
					.join("");
};

const endonymFor = (code: string): string => {
	try {
		// Resolving the name in the language's OWN locale yields the endonym
		// (pl → "polski", ja → "日本語"), identical in every UI language —
		// so the list needs no translations. Falls back to the uppercased
		// code when the runtime's ICU data does not know the language.
		const label = new Intl.DisplayNames([code], { type: "language" }).of(code);

		return label ? capitalizeEndonym(label) : code.toUpperCase();
	} catch {
		return code.toUpperCase();
	}
};

let cachedContentLanguages: ContentLanguage[] | undefined;

/**
 * Audio/subtitle languages offered in profile preferences: the full ISO 639-1
 * set, labelled with endonyms and sorted by them (diacritics-insensitive).
 */
export const CONTENT_LANGUAGES = (): ContentLanguage[] => {
	cachedContentLanguages ??= CONTENT_LANGUAGE_CODES.map((code) => ({ value: code, label: endonymFor(code) })).toSorted((a, b) =>
		a.label.localeCompare(b.label, "en", { sensitivity: "base" }),
	);

	return cachedContentLanguages;
};

/** `[value, label]` tuples for `PreferenceSelect`, with a leading "Default" entry. */
export const contentLanguageOptions = (defaultLabel: string): string[][] => [
	["", defaultLabel],
	...CONTENT_LANGUAGES().map((language) => [language.value, language.label]),
];
