import type { ProfilePreferences, UpdateProfilePreferences } from "@reelvault/sdk";

export interface ProfilePreferencesState {
	language: string;
	theme: "system" | "light" | "dark";
	autoplay: boolean;
	autoSkipIntro: boolean;
	autoSkipCredits: boolean;
	autoSkipRecap: boolean;
	audioLanguage: string;
	subtitleLanguage: string;
	/** Comma-separated language priority list tried after `subtitleLanguage`. */
	subtitleFallbackLanguages: string;
	subtitlesEnabled: boolean;
	forcedSubtitlesOnly: boolean;
	autoForcedSubtitles: boolean;
	preferHearingImpaired: boolean;
	continueWatchingMinutes: number;
	resumeRewindSeconds: number;
	watchlistAutoRemoveWatched: boolean;
	hideRatingOverlay: boolean;
	subtitleSize: "small" | "normal" | "large" | "extra-large";
	subtitlePosition: "bottom" | "top" | "middle";
	subtitleColor: "white" | "yellow" | "cyan" | "green";
	subtitleBackground: "none" | "semi" | "solid";
}

export const EMPTY_PREFERENCES: ProfilePreferencesState = {
	language: "en",
	theme: "system",
	autoplay: false,
	autoSkipIntro: false,
	autoSkipCredits: false,
	autoSkipRecap: false,
	audioLanguage: "",
	subtitleLanguage: "",
	subtitleFallbackLanguages: "",
	subtitlesEnabled: true,
	forcedSubtitlesOnly: false,
	autoForcedSubtitles: true,
	preferHearingImpaired: false,
	continueWatchingMinutes: 2,
	resumeRewindSeconds: 0,
	watchlistAutoRemoveWatched: false,
	hideRatingOverlay: false,
	subtitleSize: "normal",
	subtitlePosition: "bottom",
	subtitleColor: "white",
	subtitleBackground: "semi",
};

export const PREFERENCE_STATE_KEYS = [
	"language",
	"theme",
	"autoplay",
	"autoSkipIntro",
	"autoSkipCredits",
	"autoSkipRecap",
	"audioLanguage",
	"subtitleLanguage",
	"subtitleFallbackLanguages",
	"subtitlesEnabled",
	"forcedSubtitlesOnly",
	"autoForcedSubtitles",
	"preferHearingImpaired",
	"continueWatchingMinutes",
	"resumeRewindSeconds",
	"watchlistAutoRemoveWatched",
	"hideRatingOverlay",
	"subtitleSize",
	"subtitlePosition",
	"subtitleColor",
	"subtitleBackground",
] as const;

export type PreferenceStateKey = (typeof PREFERENCE_STATE_KEYS)[number];

export function normalizedPreferenceValue(
	key: PreferenceStateKey,
	value: string | number | boolean | null | undefined,
): string | number | boolean | null | undefined {
	if ((key === "audioLanguage" || key === "subtitleLanguage" || key === "subtitleFallbackLanguages") && value === "") return null;

	return value;
}

export function diffPreferences(next: ProfilePreferencesState, synced: ProfilePreferences): UpdateProfilePreferences {
	const delta: Record<string, unknown> = {};
	for (const key of PREFERENCE_STATE_KEYS) {
		if (normalizedPreferenceValue(key, next[key]) !== normalizedPreferenceValue(key, synced[key])) {
			delta[key] = next[key];
		}
	}

	return delta;
}
