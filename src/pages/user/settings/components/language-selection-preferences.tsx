import { PreferenceSelect, PreferenceToggle } from "@/components/preference-controls";
import { m } from "@/paraglide/messages";
import type { ProfilePreferencesState } from "@/types/profile-preferences";
import { contentLanguageOptions } from "@/utils/locales";

interface LanguageSelectionPreferencesProps {
	preferences: ProfilePreferencesState;
	onChange: (patch: Partial<ProfilePreferencesState>) => void;
}

/** Preferred viewing/subtitle languages and the smart-selection toggles that depend on them. */
export function LanguageSelectionPreferences({ preferences, onChange }: LanguageSelectionPreferencesProps) {
	return (
		<div className="flex flex-col gap-5">
			<div className="grid gap-5 sm:grid-cols-2">
				<PreferenceSelect
					label={m.settings_preferred_viewing_language()}
					description={m.settings_audio_language_desc()}
					value={preferences.audioLanguage}
					onChange={(audioLanguage) => onChange({ audioLanguage })}
					options={contentLanguageOptions(m.admin_users_default())}
				/>
				<PreferenceSelect
					label={m.admin_users_subtitle_language()}
					description={m.settings_subtitle_language_desc()}
					value={preferences.subtitleLanguage}
					onChange={(subtitleLanguage) => onChange({ subtitleLanguage })}
					options={contentLanguageOptions(m.settings_subtitle_language_same_as_audio())}
				/>
			</div>

			<div className="grid gap-3 sm:grid-cols-2">
				<PreferenceToggle
					label={m.admin_users_subtitles_enabled()}
					description={m.settings_smart_subtitles_desc()}
					checked={preferences.subtitlesEnabled}
					onChange={(subtitlesEnabled) => onChange({ subtitlesEnabled })}
				/>
				<PreferenceToggle
					label={m.admin_users_forced_only_subtitles()}
					description={m.settings_forced_only_desc()}
					checked={preferences.forcedSubtitlesOnly}
					onChange={(forcedSubtitlesOnly) => onChange({ forcedSubtitlesOnly })}
				/>
				<PreferenceToggle
					label={m.admin_users_auto_forced_subtitles()}
					description={m.settings_forced_when_match_desc()}
					checked={preferences.autoForcedSubtitles}
					onChange={(autoForcedSubtitles) => onChange({ autoForcedSubtitles })}
				/>
				<PreferenceToggle
					label={m.settings_prefer_hearing_impaired()}
					description={m.settings_prefer_sdh_desc()}
					checked={preferences.preferHearingImpaired}
					onChange={(preferHearingImpaired) => onChange({ preferHearingImpaired })}
				/>
			</div>
		</div>
	);
}
