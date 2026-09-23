import { m } from "@/paraglide/messages";
import { getLocaleTag } from "@/utils/format-utils";

// ISO 639-2/B codes (common in ffprobe language tags) are not valid BCP47
// subtags — map them to 639-1 before handing them to Intl.DisplayNames.
const B_FORM_ALIASES: Record<string, string> = {
	ger: "de",
	fre: "fr",
	chi: "zh",
	dut: "nl",
	cze: "cs",
	gre: "el",
	ice: "is",
	mac: "mk",
	may: "ms",
	bur: "my",
	alb: "sq",
	arm: "hy",
	baq: "eu",
	geo: "ka",
	rum: "ro",
	slo: "sk",
	wel: "cy",
};

// Locale is fixed for the whole document lifetime (setAppLocale does a full
// reload on switch), so the formatter is built once at module scope.
let languageDisplayNames: Intl.DisplayNames | undefined;
try {
	languageDisplayNames = new Intl.DisplayNames([getLocaleTag()], { type: "language" });
} catch {
	// Intl.DisplayNames unavailable — formatLanguage falls back to raw codes.
}

export function formatLanguage(code: string | null | undefined): string {
	if (!code || code === "und") return m.components_language_undefined();

	const normalized = B_FORM_ALIASES[code.toLowerCase()] ?? code.toLowerCase();
	try {
		return languageDisplayNames?.of(normalized) ?? code.toUpperCase();
	} catch {
		return code.toUpperCase();
	}
}
