import { useEffect, useState } from "react";
import { useAdminUserProfilePreferences } from "@/client/hooks/use-admin-user-profiles";
import { AsyncButton } from "@/components/async-button";
import { PreferenceSelect, PreferenceToggle } from "@/components/preference-controls";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import type { ProfilePreferencesState } from "@/types/profile-preferences";
import { diffPreferences, EMPTY_PREFERENCES } from "@/types/profile-preferences";
import { contentLanguageOptions, uiLocaleOptions } from "@/utils/locales";

/** Narrows a free-form <select> value to its declared union (select only offers these options). */
function pickOption<T extends string>(options: readonly T[], value: string, fallback: T): T {
	return options.find((option) => option === value) ?? fallback;
}

const THEME_VALUES = ["system", "light", "dark"] as const;
const SUBTITLE_SIZE_VALUES = ["small", "normal", "large", "extra-large"] as const;
const SUBTITLE_POSITION_VALUES = ["bottom", "top", "middle"] as const;
const SUBTITLE_COLOR_VALUES = ["white", "yellow", "cyan", "green"] as const;
const SUBTITLE_BACKGROUND_VALUES = ["semi", "none", "solid"] as const;

export function ProfilePreferencesEditor({ userId, profileId }: { userId: string; profileId: string }) {
	const { preferences, isLoading, updatePreferences, isSaving, resetPreferences, isResetting } = useAdminUserProfilePreferences(
		userId,
		profileId,
	);
	const [state, setState] = useState<ProfilePreferencesState>(EMPTY_PREFERENCES);

	useEffect(() => {
		if (!preferences) return;

		setState({
			language: preferences.language,
			theme: preferences.theme,
			autoplay: preferences.autoplay,
			autoSkipIntro: preferences.autoSkipIntro,
			autoSkipCredits: preferences.autoSkipCredits,
			autoSkipRecap: preferences.autoSkipRecap,
			audioLanguage: preferences.audioLanguage ?? "",
			subtitleLanguage: preferences.subtitleLanguage ?? "",
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
	}, [preferences]);

	// Delta-only save: values the profile did not override keep inheriting the
	// admin-configured defaults.
	const handleSubmit = async () => {
		if (!preferences) return;

		await updatePreferences(diffPreferences(state, preferences));
	};

	const handleReset = async () => {
		await resetPreferences();
	};

	if (isLoading) {
		return <p className="text-muted-foreground text-sm">{m.admin_users_loading_prefs()}</p>;
	}

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				detach(handleSubmit);
			}}
			className="flex flex-col gap-5"
		>
			<div className="grid gap-4 sm:grid-cols-2">
				<PreferenceSelect
					label={m.admin_users_ui_language()}
					value={state.language}
					onChange={(language) => setState((current) => ({ ...current, language }))}
					options={uiLocaleOptions()}
				/>
				<PreferenceSelect
					label={m.common_theme_label()}
					value={state.theme}
					onChange={(theme) => setState((current) => ({ ...current, theme: pickOption(THEME_VALUES, theme, "system") }))}
					options={[
						["system", m.common_theme_system()],
						["light", m.common_theme_light()],
						["dark", m.common_theme_dark()],
					]}
				/>
				<PreferenceSelect
					label={m.admin_users_audio_language()}
					value={state.audioLanguage}
					onChange={(audioLanguage) => setState((current) => ({ ...current, audioLanguage }))}
					options={contentLanguageOptions(m.admin_users_default())}
				/>
				<PreferenceSelect
					label={m.admin_users_subtitle_language()}
					value={state.subtitleLanguage}
					onChange={(subtitleLanguage) => setState((current) => ({ ...current, subtitleLanguage }))}
					options={contentLanguageOptions(m.admin_users_default())}
				/>
				<PreferenceSelect
					label={m.admin_users_subtitle_size()}
					value={state.subtitleSize}
					onChange={(subtitleSize) =>
						setState((current) => ({ ...current, subtitleSize: pickOption(SUBTITLE_SIZE_VALUES, subtitleSize, "normal") }))
					}
					options={[
						["small", m.admin_users_size_small()],
						["normal", m.admin_users_size_normal()],
						["large", m.admin_users_size_large()],
						["extra-large", m.admin_users_size_very_large()],
					]}
				/>
				<PreferenceSelect
					label={m.admin_users_subtitle_position()}
					value={state.subtitlePosition}
					onChange={(subtitlePosition) =>
						setState((current) => ({ ...current, subtitlePosition: pickOption(SUBTITLE_POSITION_VALUES, subtitlePosition, "bottom") }))
					}
					options={[
						["bottom", m.admin_users_position_bottom()],
						["top", m.admin_users_position_top()],
						["middle", m.admin_users_position_middle()],
					]}
				/>
				<PreferenceSelect
					label={m.admin_users_subtitle_text_color()}
					value={state.subtitleColor}
					onChange={(subtitleColor) =>
						setState((current) => ({ ...current, subtitleColor: pickOption(SUBTITLE_COLOR_VALUES, subtitleColor, "white") }))
					}
					options={[
						["white", m.admin_users_color_white()],
						["yellow", m.admin_users_color_yellow()],
						["cyan", m.admin_users_color_light_blue()],
						["green", m.admin_users_color_green()],
					]}
				/>
				<PreferenceSelect
					label={m.admin_users_subtitle_bg_style()}
					value={state.subtitleBackground}
					onChange={(subtitleBackground) =>
						setState((current) => ({ ...current, subtitleBackground: pickOption(SUBTITLE_BACKGROUND_VALUES, subtitleBackground, "semi") }))
					}
					options={[
						["semi", m.admin_users_bg_semi_transparent()],
						["none", m.admin_users_no_background()],
						["solid", m.admin_users_bg_opaque_black()],
					]}
				/>
			</div>
			<div className="grid gap-3 sm:grid-cols-3">
				<PreferenceToggle
					label={m.admin_users_autoplay_next()}
					checked={state.autoplay}
					onChange={(autoplay) => setState((current) => ({ ...current, autoplay }))}
				/>
				<PreferenceToggle
					label={m.admin_users_subtitles_enabled()}
					checked={state.subtitlesEnabled}
					onChange={(subtitlesEnabled) => setState((current) => ({ ...current, subtitlesEnabled }))}
				/>
				<PreferenceToggle
					label={m.admin_users_forced_only_subtitles()}
					checked={state.forcedSubtitlesOnly}
					onChange={(forcedSubtitlesOnly) => setState((current) => ({ ...current, forcedSubtitlesOnly }))}
				/>
				<PreferenceToggle
					label={m.admin_users_auto_forced_subtitles()}
					checked={state.autoForcedSubtitles}
					onChange={(autoForcedSubtitles) => setState((current) => ({ ...current, autoForcedSubtitles }))}
				/>
				<PreferenceToggle
					label={m.settings_prefer_hearing_impaired()}
					checked={state.preferHearingImpaired}
					onChange={(preferHearingImpaired) => setState((current) => ({ ...current, preferHearingImpaired }))}
				/>
				<PreferenceToggle
					label={m.admin_users_auto_skip_intro()}
					checked={state.autoSkipIntro}
					onChange={(autoSkipIntro) => setState((current) => ({ ...current, autoSkipIntro }))}
				/>
				<PreferenceToggle
					label={m.admin_users_auto_skip_credits()}
					checked={state.autoSkipCredits}
					onChange={(autoSkipCredits) => setState((current) => ({ ...current, autoSkipCredits }))}
				/>
				<PreferenceToggle
					label={m.admin_users_auto_skip_recap()}
					checked={state.autoSkipRecap}
					onChange={(autoSkipRecap) => setState((current) => ({ ...current, autoSkipRecap }))}
				/>
			</div>
			<div className="flex gap-2">
				<AsyncButton type="submit" isPending={isSaving} pendingLabel={m.user_saving_prefs()} className="min-h-10 w-fit gap-2">
					{m.admin_users_save_prefs()}
				</AsyncButton>
				<AsyncButton
					type="button"
					isPending={isResetting}
					pendingLabel={m.common_restoring()}
					onClick={() => detach(handleReset)}
					variant="outline"
					className="min-h-10 w-fit gap-2"
				>
					{m.admin_settings_restore_default()}
				</AsyncButton>
			</div>
		</form>
	);
}
