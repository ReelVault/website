import { useTheme } from "next-themes";
import type React from "react";
import { useEffect, useState } from "react";
import { useProfilePreferences, useResetProfilePreferences } from "@/client/hooks/use-profiles";
import { AsyncButton } from "@/components/async-button";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { diffPreferences, EMPTY_PREFERENCES, type ProfilePreferencesState } from "@/types/profile-preferences";
import { LanguageSelectionPreferences } from "../components/language-selection-preferences";
import { PlaybackAutomationToggles } from "../components/playback-automation-toggles";
import { SettingsCategory } from "../components/settings-category";
import { SubtitleStylePreferences } from "../components/subtitle-style-preferences";

interface PlaybackPreferencesSectionProps {
	profileId: string;
}

type ServerPreferences = NonNullable<ReturnType<typeof useProfilePreferences>["preferences"]>;

// Maps server preferences (nullable extras) onto the editable preferences state.
const toPreferencesState = (value: ServerPreferences): ProfilePreferencesState => ({
	language: value.language,
	theme: value.theme,
	autoplay: value.autoplay,
	autoSkipIntro: value.autoSkipIntro,
	autoSkipCredits: value.autoSkipCredits,
	autoSkipRecap: value.autoSkipRecap,
	audioLanguage: value.audioLanguage ?? "",
	subtitleLanguage: value.subtitleLanguage ?? "",
	subtitlesEnabled: value.subtitlesEnabled,
	forcedSubtitlesOnly: value.forcedSubtitlesOnly,
	autoForcedSubtitles: value.autoForcedSubtitles,
	preferHearingImpaired: value.preferHearingImpaired,
	continueWatchingMinutes: value.continueWatchingMinutes,
	subtitleSize: value.subtitleSize,
	subtitlePosition: value.subtitlePosition,
	subtitleColor: value.subtitleColor,
	subtitleBackground: value.subtitleBackground,
});

export function PlaybackPreferencesSection({ profileId }: PlaybackPreferencesSectionProps) {
	const { setTheme } = useTheme();
	const preferencesQuery = useProfilePreferences(profileId);
	const resetPreferences = useResetProfilePreferences(profileId);
	const serverPreferences = preferencesQuery.preferences;
	const [preferences, setPreferences] = useState<ProfilePreferencesState>(() =>
		serverPreferences ? toPreferencesState(serverPreferences) : EMPTY_PREFERENCES,
	);

	// Adopt fresh server preferences while rendering (React's documented
	// "adjust state when props change" pattern): the identity of
	// serverPreferences changes whenever preferences are re-fetched.
	const [lastSyncedPreferences, setLastSyncedPreferences] = useState(serverPreferences);
	if (serverPreferences && serverPreferences !== lastSyncedPreferences) {
		setLastSyncedPreferences(serverPreferences);
		setPreferences(toPreferencesState(serverPreferences));
	}

	// Apply the server-assigned theme whenever fresh server preferences arrive.
	useEffect(() => {
		if (serverPreferences) {
			setTheme(serverPreferences.theme);
		}
	}, [serverPreferences, setTheme]);

	const updatePreferencesPatch = (patch: Partial<ProfilePreferencesState>) => {
		setPreferences((current) => ({ ...current, ...patch }));
	};

	const savePreferences = async () => {
		const synced = preferencesQuery.preferences;
		if (synced) {
			const delta = diffPreferences(preferences, synced);
			if (Object.keys(delta).length === 0) return;

			await preferencesQuery.updatePreferences(delta);
		} else {
			await preferencesQuery.updatePreferences({
				language: preferences.language,
				theme: preferences.theme,
				autoplay: preferences.autoplay,
				autoSkipIntro: preferences.autoSkipIntro,
				autoSkipCredits: preferences.autoSkipCredits,
				autoSkipRecap: preferences.autoSkipRecap,
				audioLanguage: preferences.audioLanguage,
				subtitleLanguage: preferences.subtitleLanguage,
				subtitlesEnabled: preferences.subtitlesEnabled,
				forcedSubtitlesOnly: preferences.forcedSubtitlesOnly,
				autoForcedSubtitles: preferences.autoForcedSubtitles,
				preferHearingImpaired: preferences.preferHearingImpaired,
				continueWatchingMinutes: preferences.continueWatchingMinutes,
				subtitleSize: preferences.subtitleSize,
				subtitlePosition: preferences.subtitlePosition,
				subtitleColor: preferences.subtitleColor,
				subtitleBackground: preferences.subtitleBackground,
			});
		}

		setTheme(preferences.theme);
	};

	const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (preferencesQuery.isSaving || preferencesQuery.isLoading) return;

		detach(savePreferences());
	};

	const handleReset = async () => {
		if (resetPreferences.isPending) return;

		const defaults = await resetPreferences.mutateAsync();
		setPreferences(toPreferencesState(defaults));
		setTheme(defaults.theme);
	};

	return (
		<form onSubmit={handleSubmit} className="cinema-surface flex flex-col gap-6 p-5 sm:p-8">
			<div>
				<h2 className="font-bold text-xl">{m.admin_users_playback_prefs()}</h2>
			</div>

			<SettingsCategory title={m.settings_languages_title()}>
				<LanguageSelectionPreferences preferences={preferences} onChange={updatePreferencesPatch} />
			</SettingsCategory>

			<SettingsCategory title={m.user_subtitle_look_position()}>
				<SubtitleStylePreferences
					size={preferences.subtitleSize}
					position={preferences.subtitlePosition}
					color={preferences.subtitleColor}
					background={preferences.subtitleBackground}
					onChangeSize={(subtitleSize) => updatePreferencesPatch({ subtitleSize })}
					onChangePosition={(subtitlePosition) => updatePreferencesPatch({ subtitlePosition })}
					onChangeColor={(subtitleColor) => updatePreferencesPatch({ subtitleColor })}
					onChangeBackground={(subtitleBackground) => updatePreferencesPatch({ subtitleBackground })}
				/>
			</SettingsCategory>

			<SettingsCategory title={m.settings_automations_title()}>
				<PlaybackAutomationToggles preferences={preferences} onChange={updatePreferencesPatch} />
			</SettingsCategory>

			<div className="flex flex-col gap-3 sm:flex-row">
				<AsyncButton
					type="submit"
					isPending={preferencesQuery.isSaving || preferencesQuery.isLoading}
					pendingLabel={m.user_saving_prefs()}
					className="min-h-11"
				>
					{m.admin_users_save_prefs()}
				</AsyncButton>
				<AsyncButton
					type="button"
					isPending={resetPreferences.isPending}
					pendingLabel={m.common_restoring()}
					onClick={() => {
						detach(handleReset());
					}}
					className="min-h-11"
				>
					{m.admin_settings_restore_default()}
				</AsyncButton>
			</div>
		</form>
	);
}
