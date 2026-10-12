import { PreferenceSelect } from "@/components/preference-controls";
import { m } from "@/paraglide/messages";
import type { ProfilePreferencesState } from "@/types/profile-preferences";
import { LanguageSelectionPreferences } from "./language-selection-preferences";
import { PlaybackAutomationToggles } from "./playback-automation-toggles";
import { SettingsCategory } from "./settings-category";
import { SubtitleStylePreferences } from "./subtitle-style-preferences";

interface ProfilePreferenceFieldsProps {
	preferences: ProfilePreferencesState;
	onChange: (patch: Partial<ProfilePreferencesState>) => void;
}

/**
 * Playback preferences of one profile: languages, subtitle look, video quality and
 * automations. The user's own settings and the admin's profile editor both render it.
 */
export function ProfilePreferenceFields({ preferences, onChange }: ProfilePreferenceFieldsProps) {
	return (
		<>
			<SettingsCategory title={m.settings_languages_title()}>
				<LanguageSelectionPreferences preferences={preferences} onChange={onChange} />
			</SettingsCategory>

			<SettingsCategory title={m.user_subtitle_look_position()}>
				<SubtitleStylePreferences preferences={preferences} onChange={onChange} />
			</SettingsCategory>

			<SettingsCategory title={m.user_video_quality_title()}>
				<div className="grid gap-3 sm:grid-cols-2">
					<PreferenceSelect
						label={m.user_hdr_playback_label()}
						description={m.user_hdr_playback_desc()}
						value={preferences.hdrMode}
						onChange={(hdrMode) => onChange({ hdrMode: hdrMode === "toneMapToSdr" ? "toneMapToSdr" : "auto" })}
						options={[
							["auto", m.user_hdr_mode_auto()],
							["toneMapToSdr", m.user_hdr_mode_tone_map()],
						]}
					/>
					<PreferenceSelect
						label={m.user_stream_limit_label()}
						description={m.user_stream_limit_desc()}
						value={String(preferences.maxStreamingBitrateKbps)}
						onChange={(value) => onChange({ maxStreamingBitrateKbps: Number(value) })}
						options={[
							["0", m.user_stream_limit_unlimited()],
							["1500", m.user_stream_limit_mbps({ mbps: "1.5" })],
							["4000", m.user_stream_limit_mbps({ mbps: "4" })],
							["8000", m.user_stream_limit_mbps({ mbps: "8" })],
						]}
					/>
				</div>
			</SettingsCategory>

			<SettingsCategory title={m.settings_automations_title()}>
				<PlaybackAutomationToggles preferences={preferences} onChange={onChange} />
			</SettingsCategory>
		</>
	);
}
