import { PreferenceSelect, PreferenceToggle } from "@/components/preference-controls";
import { m } from "@/paraglide/messages";
import type { ProfilePreferencesState } from "@/types/profile-preferences";

const RESUME_REWIND_SECONDS = ["0", "5", "10", "15", "30"] as const;

interface PlaybackAutomationTogglesProps {
	preferences: ProfilePreferencesState;
	onChange: (patch: Partial<ProfilePreferencesState>) => void;
}

/** Toggles for actions the player takes on its own: next-episode autoplay and marker-based skipping. */
export function PlaybackAutomationToggles({ preferences, onChange }: PlaybackAutomationTogglesProps) {
	return (
		<div className="grid gap-3 sm:grid-cols-2">
			<PreferenceToggle
				label={m.admin_users_autoplay_next()}
				description={m.settings_autoplay_desc()}
				checked={preferences.autoplay}
				onChange={(autoplay) => onChange({ autoplay })}
			/>
			<PreferenceToggle
				label={m.user_auto_skip_intro_label()}
				description={m.settings_skip_intro_desc()}
				checked={preferences.autoSkipIntro}
				onChange={(autoSkipIntro) => onChange({ autoSkipIntro })}
			/>
			<PreferenceToggle
				label={m.admin_users_auto_skip_credits()}
				description={m.settings_skip_credits_desc()}
				checked={preferences.autoSkipCredits}
				onChange={(autoSkipCredits) => onChange({ autoSkipCredits })}
			/>
			<PreferenceToggle
				label={m.admin_users_auto_skip_recap()}
				description={m.settings_skip_recap_desc()}
				checked={preferences.autoSkipRecap}
				onChange={(autoSkipRecap) => onChange({ autoSkipRecap })}
			/>
			<PreferenceSelect
				label={m.settings_resume_rewind()}
				description={m.settings_resume_rewind_desc()}
				value={String(preferences.resumeRewindSeconds)}
				onChange={(seconds) => onChange({ resumeRewindSeconds: Number(seconds) })}
				options={RESUME_REWIND_SECONDS.map((seconds) => [
					seconds,
					seconds === "0" ? m.settings_resume_rewind_off() : m.settings_resume_rewind_seconds({ seconds }),
				])}
			/>
		</div>
	);
}
