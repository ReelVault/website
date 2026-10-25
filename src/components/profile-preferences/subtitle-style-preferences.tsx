import { cn } from "cn";
import { PreferenceSelect } from "@/components/preference-controls";
import { m } from "@/paraglide/messages";
import type { ProfilePreferencesState } from "@/types/profile-preferences";

const SIZE_PREVIEW_CLASSES = {
	small: "text-sm",
	normal: "text-base",
	large: "text-xl",
	"extra-large": "text-2xl",
} as const;

const COLOR_PREVIEW_CLASSES = {
	white: "text-white",
	yellow: "text-yellow-300",
	cyan: "text-cyan-300",
	green: "text-green-300",
} as const;

const BG_PREVIEW_CLASSES = {
	none: "bg-transparent",
	semi: "bg-black/60",
	solid: "bg-black",
} as const;

const isSubtitleSize = (value: string): value is ProfilePreferencesState["subtitleSize"] =>
	value === "small" || value === "normal" || value === "large" || value === "extra-large";

const isSubtitlePosition = (value: string): value is ProfilePreferencesState["subtitlePosition"] =>
	value === "bottom" || value === "top" || value === "middle";

const isSubtitleColor = (value: string): value is ProfilePreferencesState["subtitleColor"] =>
	value === "white" || value === "yellow" || value === "cyan" || value === "green";

const isSubtitleBackground = (value: string): value is ProfilePreferencesState["subtitleBackground"] =>
	value === "semi" || value === "none" || value === "solid";

interface SubtitleStylePreferencesProps {
	preferences: ProfilePreferencesState;
	onChange: (patch: Partial<ProfilePreferencesState>) => void;
}

/** Subtitle size, position, colour and background, with a live preview of the chosen look. */
export function SubtitleStylePreferences({ preferences, onChange }: SubtitleStylePreferencesProps) {
	const { subtitleSize: size, subtitlePosition: position, subtitleColor: color, subtitleBackground: background } = preferences;

	return (
		<>
			<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
				<PreferenceSelect
					label={m.admin_users_subtitle_size()}
					value={size}
					onChange={(value) => {
						if (isSubtitleSize(value)) onChange({ subtitleSize: value });
					}}
					options={[
						["small", m.admin_users_size_small()],
						["normal", m.admin_users_size_normal()],
						["large", m.admin_users_size_large()],
						["extra-large", m.admin_users_size_very_large()],
					]}
				/>
				<PreferenceSelect
					label={m.user_vertical_position()}
					value={position}
					onChange={(value) => {
						if (isSubtitlePosition(value)) onChange({ subtitlePosition: value });
					}}
					options={[
						["bottom", m.admin_users_position_bottom()],
						["top", m.admin_users_position_top()],
						["middle", m.admin_users_position_middle()],
					]}
				/>
				<PreferenceSelect
					label={m.player_text_color()}
					value={color}
					onChange={(value) => {
						if (isSubtitleColor(value)) onChange({ subtitleColor: value });
					}}
					options={[
						["white", m.admin_users_color_white()],
						["yellow", m.admin_users_color_yellow()],
						["cyan", m.admin_users_color_light_blue()],
						["green", m.admin_users_color_green()],
					]}
				/>
				<PreferenceSelect
					label={m.user_background_style()}
					value={background}
					onChange={(value) => {
						if (isSubtitleBackground(value)) onChange({ subtitleBackground: value });
					}}
					options={[
						["semi", m.user_bg_semi_transparent_default()],
						["none", m.admin_users_no_background()],
						["solid", m.admin_users_bg_opaque_black()],
					]}
				/>
			</div>

			{/* Live preview */}
			<div className="border-border relative flex h-28 w-full items-center justify-center overflow-hidden rounded-xl border bg-slate-900/90 p-4">
				<span className="text-muted-foreground absolute top-2 left-3 text-xs font-semibold">{m.admin_subtitles_preview()}</span>
				<div
					className={cn(
						"rounded-md px-4 py-1.5 font-sans font-medium tracking-wide shadow-md [text-shadow:0_1px_4px_rgb(0_0_0/90%),0_2px_10px_rgb(0_0_0/80%)]",
						SIZE_PREVIEW_CLASSES[size],
						COLOR_PREVIEW_CLASSES[color],
						BG_PREVIEW_CLASSES[background],
					)}
				>
					{m.user_sample_subtitle_text()}
				</div>
			</div>
		</>
	);
}
