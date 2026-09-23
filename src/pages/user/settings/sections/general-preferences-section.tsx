import { useTheme } from "next-themes";
import type React from "react";
import { useEffect, useState } from "react";
import { useProfilePreferences } from "@/client/hooks/use-profiles";
import { AsyncButton } from "@/components/async-button";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { GeneralPreferencesGrid } from "../components/general-preferences-grid";
import { SettingsCategory } from "../components/settings-category";

interface GeneralPreferences {
	language: string;
	theme: ProfilePreferencesTheme;
	continueWatchingMinutes: number;
}

type ProfilePreferencesTheme = "system" | "light" | "dark";

/** General (non-playback) profile preferences: interface language, theme and continue-watching threshold. */
export function GeneralPreferencesSection({ profileId }: { profileId: string }) {
	const { setTheme } = useTheme();
	const preferencesQuery = useProfilePreferences(profileId);
	const serverPreferences = preferencesQuery.preferences;
	const [preferences, setPreferences] = useState<GeneralPreferences | undefined>(
		serverPreferences
			? {
					language: serverPreferences.language,
					theme: serverPreferences.theme,
					continueWatchingMinutes: serverPreferences.continueWatchingMinutes,
				}
			: undefined,
	);

	// Adopt fresh server preferences while rendering (React's documented
	// "adjust state when props change" pattern).
	const [lastSynced, setLastSynced] = useState(serverPreferences);
	if (serverPreferences && serverPreferences !== lastSynced) {
		setLastSynced(serverPreferences);
		setPreferences({
			language: serverPreferences.language,
			theme: serverPreferences.theme,
			continueWatchingMinutes: serverPreferences.continueWatchingMinutes,
		});
	}

	// Apply the server-assigned theme whenever fresh server preferences arrive.
	useEffect(() => {
		if (serverPreferences) {
			setTheme(serverPreferences.theme);
		}
	}, [serverPreferences, setTheme]);

	if (!preferences) return null;

	const updatePreferencesPatch = (patch: Partial<GeneralPreferences>) => {
		setPreferences((current) => (current ? { ...current, ...patch } : current));
	};

	const savePreferences = async () => {
		const synced = preferencesQuery.preferences;
		if (!synced) return;

		const patch: Partial<GeneralPreferences> = {};
		if (preferences.language !== synced.language) patch.language = preferences.language;

		if (preferences.theme !== synced.theme) patch.theme = preferences.theme;

		if (preferences.continueWatchingMinutes !== synced.continueWatchingMinutes)
			patch.continueWatchingMinutes = preferences.continueWatchingMinutes;

		if (patch.language === undefined && patch.theme === undefined && patch.continueWatchingMinutes === undefined) return;

		await preferencesQuery.updatePreferences(patch);
		setTheme(preferences.theme);
	};

	const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (preferencesQuery.isSaving || preferencesQuery.isLoading) return;

		detach(savePreferences());
	};

	return (
		<form onSubmit={handleSubmit} className="cinema-surface flex flex-col gap-6 p-5 sm:p-8">
			<SettingsCategory title={m.settings_general_title()} description={m.settings_general_hint()}>
				<GeneralPreferencesGrid preferences={preferences} onChange={updatePreferencesPatch} />
			</SettingsCategory>

			<div>
				<AsyncButton
					type="submit"
					isPending={preferencesQuery.isSaving || preferencesQuery.isLoading}
					pendingLabel={m.user_saving_prefs()}
					className="min-h-11"
				>
					{m.admin_users_save_prefs()}
				</AsyncButton>
			</div>
		</form>
	);
}
