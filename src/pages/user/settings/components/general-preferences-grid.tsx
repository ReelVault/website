import { PreferenceSelect } from "@/components/preference-controls";
import { m } from "@/paraglide/messages";
import { uiLocaleOptions } from "@/utils/locales";

interface GeneralPreferencesGridProps {
	preferences: { language: string; theme: "system" | "light" | "dark"; continueWatchingMinutes: number };
	onChange: (patch: Partial<{ language: string; theme: "system" | "light" | "dark"; continueWatchingMinutes: number }>) => void;
}

const THEMES = ["system", "light", "dark"] as const;
const CONTINUE_WATCHING_MINUTES = ["0", "1", "2", "3", "5", "10", "15", "30"] as const;

export function GeneralPreferencesGrid({ preferences, onChange }: GeneralPreferencesGridProps) {
	return (
		<div className="grid gap-5 sm:grid-cols-2">
			<PreferenceSelect
				label={m.admin_users_ui_language()}
				description={m.settings_ui_language_desc()}
				value={preferences.language}
				onChange={(language) => onChange({ language })}
				options={uiLocaleOptions()}
			/>
			<PreferenceSelect
				label={m.common_theme_label()}
				description={m.settings_theme_desc()}
				value={preferences.theme}
				onChange={(theme) => {
					const picked = THEMES.find((candidate) => candidate === theme);
					if (picked) {
						onChange({ theme: picked });
					}
				}}
				options={[
					["system", m.common_theme_system()],
					["light", m.common_theme_light()],
					["dark", m.common_theme_dark()],
				]}
			/>
			<PreferenceSelect
				label={m.settings_continue_watching_threshold()}
				description={m.settings_continue_watching_threshold_desc()}
				value={String(preferences.continueWatchingMinutes)}
				onChange={(minutes) => {
					const picked = CONTINUE_WATCHING_MINUTES.find((candidate) => candidate === minutes);
					if (picked) {
						onChange({ continueWatchingMinutes: Number(picked) });
					}
				}}
				options={CONTINUE_WATCHING_MINUTES.map((minutes) => [minutes, minutes === "0" ? m.settings_continue_immediately() : minutes])}
			/>
		</div>
	);
}
