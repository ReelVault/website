import { useNavigate, useSearch } from "@tanstack/react-router";
import { cn } from "cn";
import { Check, Keyboard, Layers, Settings, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { useCurrentUser } from "@/client/hooks/use-current-profile";
import { useMediaFilesByEpisode, useMediaFilesByMetadata } from "@/client/hooks/use-media";
import { useProfilePreferences } from "@/client/hooks/use-profiles";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { m } from "@/paraglide/messages";
import { usePlayerActions, usePlayerInfo, usePlayerSettings, usePlayerVolume } from "../player-context";
import { PLAYBACK_SPEED_STEPS } from "../utils/player-speed";
import { detach, getVersionLabel } from "../utils/player-utils";
import { PlayerControlButton } from "./player-control-button";
import { PlayerShortcutsDialog } from "./player-shortcuts-dialog";

const QUALITY_OPTIONS: ReadonlyArray<{
	value: "auto" | "5000" | "2500" | "1200";
	bitrate: number | undefined;
	readonly label: string;
}> = [
	{
		value: "auto",
		bitrate: undefined,
		get label() {
			return m.player_quality_auto();
		},
	},
	{
		value: "5000",
		bitrate: 5000,
		get label() {
			return m.player_quality_high();
		},
	},
	{
		value: "2500",
		bitrate: 2500,
		get label() {
			return m.player_quality_hd();
		},
	},
	{
		value: "1200",
		bitrate: 1200,
		get label() {
			return m.player_saver();
		},
	},
];

/** A switch row for the mobile settings sheet; the check mark shows the stored state. */
function PreferenceRow({
	label,
	checked,
	disabled,
	onToggle,
}: {
	label: string;
	checked: boolean;
	disabled: boolean;
	onToggle: () => void;
}) {
	return (
		<button
			type="button"
			aria-pressed={checked}
			disabled={disabled}
			onClick={onToggle}
			className="flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 text-left text-sm transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
		>
			{label}
			{checked && <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />}
		</button>
	);
}

function SpeedSlider({
	playbackRate,
	onRateChange,
	className,
}: {
	playbackRate: number;
	onRateChange: (rate: number) => void;
	className?: string;
}) {
	// Percentage fill for the speed slider (0.25 → 3)
	const speedMin = PLAYBACK_SPEED_STEPS[0];
	const speedMax = Math.max(...PLAYBACK_SPEED_STEPS);
	const fillPercent = ((playbackRate - speedMin) / (speedMax - speedMin)) * 100;

	return (
		<div className={cn("relative flex h-10 items-center sm:h-8", className)}>
			<div className="relative z-0 h-1.25 w-full rounded-sm bg-foreground/30">
				<div className="absolute inset-y-0 left-0 rounded-sm bg-primary transition-[width]" style={{ width: `${fillPercent}%` }} />
				<div className="absolute inset-0 flex items-center justify-between px-0">
					{PLAYBACK_SPEED_STEPS.map((step) => (
						<div key={step} className="h-1.5 w-0.5 bg-muted-foreground opacity-60" />
					))}
				</div>
			</div>
			<input
				type="range"
				min={speedMin}
				max={speedMax}
				step={0.25}
				value={playbackRate}
				aria-label={m.player_speed_playback_playbackrate_2({ playbackRate })}
				className="absolute inset-0 z-10 h-full w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-progress]:bg-transparent [&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-foreground [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-border [&::-webkit-slider-thumb]:bg-foreground"
				onChange={(e) => onRateChange(Number(e.target.value))}
			/>
		</div>
	);
}

export function PlayerSettingsMenu({
	onOpenShortcuts,
	onOpenEqualizer,
	shortcutsDisabled = false,
	onShortcutsDisabledChange,
}: {
	onOpenShortcuts?: () => void;
	onOpenEqualizer?: () => void;
	shortcutsDisabled?: boolean;
	onShortcutsDisabledChange?: (disabled: boolean) => void;
} = {}) {
	const navigate = useNavigate();
	const [localShortcutsOpen, setLocalShortcutsOpen] = useState(false);
	const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
	// File-version queries only while the menu is open (desktop dropdown or mobile sheet).
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const handleOpenShortcuts = onOpenShortcuts ?? (() => setLocalShortcutsOpen(true));
	const isMobile = useIsMobile();
	const info = usePlayerInfo();
	const { maxBitrate, onQualityChange } = usePlayerSettings();
	const { playbackRate } = usePlayerVolume();
	const actions = usePlayerActions();
	const { profile } = useCurrentUser();
	const { preferences, updatePreferences, isSaving } = useProfilePreferences(profile?.id);
	// Autoplay and skip-intro are profile preferences; the player reads them live, so a flip applies right away.
	const canEditPreferences = Boolean(preferences) && !isSaving;
	const toggleAutoplay = () => {
		if (preferences) detach(updatePreferences({ autoplay: !preferences.autoplay }));
	};
	const toggleAutoSkipIntro = () => {
		if (preferences) detach(updatePreferences({ autoSkipIntro: !preferences.autoSkipIntro }));
	};

	const { data: episodeFiles = [] } = useMediaFilesByEpisode(info.episodeId, { enabled: isMenuOpen });
	const { data: metadataFiles = [] } = useMediaFilesByMetadata(!info.episodeId ? info.metadataId : null, { enabled: isMenuOpen });
	const availableVersions = info.episodeId ? episodeFiles : metadataFiles;

	const activeQualityLabel = QUALITY_OPTIONS.find((option) => option.bitrate === maxBitrate)?.label ?? m.player_quality_auto();

	// A version switch inside a collection stays in that collection's context.
	const { collection, collectionId } = useSearch({ from: "/player/$id" });
	const selectVersion = (newId: string) => {
		if (newId && newId !== info.mediaFileId) {
			const search = collection ? { collection: true, ...(collectionId ? { collectionId } : {}) } : {};
			detach(() => navigate({ to: "/player/$id", params: { id: newId }, search }));
		}
	};

	const selectQuality = (value: string) => {
		onQualityChange(value === "auto" ? undefined : Number(value));
	};

	// -------------------------------------------------------------------
	// Mobile settings sheet — same options as the dropdown, as rows.
	// -------------------------------------------------------------------
	const mobileSheet = (
		<Sheet
			open={mobileSheetOpen}
			onOpenChange={(open) => {
				setMobileSheetOpen(open);
				setIsMenuOpen(open);
			}}
		>
			<SheetContent side="bottom" className="max-h-[85svh] overflow-y-auto rounded-t-2xl">
				<SheetHeader>
					<SheetTitle>{m.player_settings_heading()}</SheetTitle>
					<SheetDescription>{m.player_quality_menu_description()}</SheetDescription>
				</SheetHeader>
				<div className="flex flex-col gap-5 overflow-y-auto px-1 pb-6">
					{availableVersions.length > 1 && (
						<section className="flex flex-col gap-1">
							<p className="flex items-center gap-1.5 px-1 font-bold text-muted-foreground text-xs uppercase tracking-wider">
								<Layers className="size-3.5 text-primary" />
								{m.player_version_named({ count: availableVersions.length })}
							</p>
							{availableVersions.map((file, idx) => {
								const label = getVersionLabel(file.edition, file.qualityTag, idx);
								const meta = [file.qualityTag, file.source].filter(Boolean).join(" • ");
								const isSelected = file.id === info.mediaFileId;

								return (
									<button
										key={file.id}
										type="button"
										onClick={() => selectVersion(file.id)}
										className={cn(
											"flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent",
											isSelected && "bg-primary/10",
										)}
									>
										<span className="flex flex-col gap-0.5">
											<span className="flex items-center gap-1.5 font-medium text-sm">
												{label}
												{file.isDefault && <span className="text-[10px] text-primary">{m.web_default()}</span>}
											</span>
											{meta && <span className="text-muted-foreground text-xs">{meta}</span>}
										</span>
										{isSelected && <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />}
									</button>
								);
							})}
						</section>
					)}

					<section className="flex flex-col gap-1">
						<p className="px-1 font-bold text-muted-foreground text-xs uppercase tracking-wider">
							{m.player_quality_label({ activeQualityLabel })}
						</p>
						{QUALITY_OPTIONS.map((option) => {
							const isSelected = (maxBitrate ? String(maxBitrate) : "auto") === option.value;

							return (
								<button
									key={option.value}
									type="button"
									onClick={() => selectQuality(option.value)}
									className={cn(
										"flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 text-left font-medium text-sm transition-colors hover:bg-accent",
										isSelected && "bg-primary/10",
									)}
								>
									{option.label}
									{isSelected && <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />}
								</button>
							);
						})}
					</section>

					<section className="flex flex-col gap-2">
						<p className="px-1 font-bold text-muted-foreground text-xs uppercase tracking-wider">
							{m.player_speed_playback_playbackrate({ playbackRate })}
						</p>
						<SpeedSlider playbackRate={playbackRate} onRateChange={(rate) => actions.setPlaybackRate(rate)} className="mx-1" />
					</section>

					<section className="flex flex-col gap-1">
						<PreferenceRow
							label={m.admin_users_autoplay_next()}
							checked={preferences?.autoplay ?? false}
							disabled={!canEditPreferences}
							onToggle={toggleAutoplay}
						/>
						<PreferenceRow
							label={m.user_auto_skip_intro_label()}
							checked={preferences?.autoSkipIntro ?? false}
							disabled={!canEditPreferences}
							onToggle={toggleAutoSkipIntro}
						/>
					</section>

					{onOpenEqualizer && (
						<section className="flex flex-col gap-1">
							<button
								type="button"
								onClick={onOpenEqualizer}
								className="flex min-h-11 items-center gap-2.5 rounded-lg px-3 text-left text-sm transition-colors hover:bg-accent"
							>
								<SlidersHorizontal className="size-4 text-muted-foreground" />
								{m.player_audio_equalizer()}
							</button>
						</section>
					)}

					<section className="flex flex-col gap-1">
						<button
							type="button"
							onClick={() => onShortcutsDisabledChange?.(!shortcutsDisabled)}
							className="flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 text-left text-sm transition-colors hover:bg-accent"
						>
							<span className="flex items-center gap-2.5">
								<Keyboard className="size-4 text-muted-foreground" />
								{m.player_shortcuts_enabled_status()}
							</span>
							{!shortcutsDisabled && <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />}
						</button>
						<button
							type="button"
							onClick={handleOpenShortcuts}
							className="flex min-h-11 items-center gap-2.5 rounded-lg px-3 text-left text-sm transition-colors hover:bg-accent"
						>
							<Keyboard className="size-4 text-muted-foreground" />
							{m.player_list_shortcut_key()}
						</button>
					</section>
				</div>
			</SheetContent>
		</Sheet>
	);

	const mobileTrigger = (
		<PlayerControlButton
			description={m.player_settings_word()}
			render={<button type="button" aria-label={m.player_settings_heading()} onClick={() => setMobileSheetOpen(true)} />}
		>
			<Settings className="size-5" aria-hidden="true" />
		</PlayerControlButton>
	);

	return (
		<>
			{isMobile ? (
				mobileTrigger
			) : (
				<DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
					<PlayerControlButton
						description={m.player_settings_word()}
						render={<DropdownMenuTrigger aria-label={m.player_settings_heading()} />}
					>
						<Settings className="size-5" aria-hidden="true" />
					</PlayerControlButton>
					<DropdownMenuContent side="top" align="end" className="w-72">
						{availableVersions.length > 1 && (
							<>
								<DropdownMenuRadioGroup value={info.mediaFileId} onValueChange={(newId) => selectVersion(String(newId))}>
									<DropdownMenuLabel className="flex items-center gap-1.5 font-bold text-muted-foreground text-xs uppercase tracking-wider">
										<Layers className="size-3.5 text-primary" />
										<span>{m.player_version_named({ count: availableVersions.length })}</span>
									</DropdownMenuLabel>
									{availableVersions.map((file, idx) => {
										const label = getVersionLabel(file.edition, file.qualityTag, idx);
										const meta = [file.qualityTag, file.source].filter(Boolean).join(" • ");

										return (
											<DropdownMenuRadioItem key={file.id} value={file.id} className="cursor-pointer py-1.5">
												<div className="flex flex-col gap-0.5">
													<div className="flex items-center gap-1.5 font-medium text-sm">
														<span>{label}</span>
														{file.isDefault && <span className="text-[10px] text-primary">{m.web_default()}</span>}
													</div>
													{meta && <span className="text-muted-foreground text-xs">{meta}</span>}
												</div>
											</DropdownMenuRadioItem>
										);
									})}
								</DropdownMenuRadioGroup>
								<DropdownMenuSeparator />
							</>
						)}

						<DropdownMenuRadioGroup value={maxBitrate ? String(maxBitrate) : "auto"} onValueChange={selectQuality}>
							<DropdownMenuLabel>{m.player_quality_label({ activeQualityLabel })}</DropdownMenuLabel>
							{QUALITY_OPTIONS.map((option) => (
								<DropdownMenuRadioItem key={option.value} value={option.value}>
									{option.label}
								</DropdownMenuRadioItem>
							))}
						</DropdownMenuRadioGroup>

						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuLabel>{m.player_speed_playback_playbackrate({ playbackRate })}</DropdownMenuLabel>
							<div className="px-2 pt-1 pb-2">
								<SpeedSlider playbackRate={playbackRate} onRateChange={(rate) => actions.setPlaybackRate(rate)} className="w-full" />
							</div>
						</DropdownMenuGroup>

						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuCheckboxItem
								checked={preferences?.autoplay ?? false}
								disabled={!canEditPreferences}
								onCheckedChange={toggleAutoplay}
								className="cursor-pointer gap-2.5"
							>
								<span>{m.admin_users_autoplay_next()}</span>
							</DropdownMenuCheckboxItem>
							<DropdownMenuCheckboxItem
								checked={preferences?.autoSkipIntro ?? false}
								disabled={!canEditPreferences}
								onCheckedChange={toggleAutoSkipIntro}
								className="cursor-pointer gap-2.5"
							>
								<span>{m.user_auto_skip_intro_label()}</span>
							</DropdownMenuCheckboxItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							{onOpenEqualizer && (
								<DropdownMenuItem onClick={onOpenEqualizer} className="cursor-pointer gap-2.5">
									<SlidersHorizontal className="size-4 text-muted-foreground" />
									<span>{m.player_audio_equalizer()}</span>
								</DropdownMenuItem>
							)}
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuCheckboxItem
								checked={!shortcutsDisabled}
								onCheckedChange={(checked) => onShortcutsDisabledChange?.(!checked)}
								className="cursor-pointer gap-2.5"
							>
								<Keyboard className="size-4 text-muted-foreground" />
								<span>{m.player_shortcuts_enabled_status()}</span>
							</DropdownMenuCheckboxItem>
							<DropdownMenuItem onClick={handleOpenShortcuts} className="cursor-pointer gap-2.5">
								<Keyboard className="size-4 text-muted-foreground" />
								<span>{m.player_list_shortcut_key()}</span>
							</DropdownMenuItem>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			)}

			{isMobile && mobileSheet}

			{!onOpenShortcuts && (
				<PlayerShortcutsDialog
					open={localShortcutsOpen}
					onOpenChange={setLocalShortcutsOpen}
					shortcutsDisabled={shortcutsDisabled}
					onShortcutsDisabledChange={onShortcutsDisabledChange}
				/>
			)}
		</>
	);
}
