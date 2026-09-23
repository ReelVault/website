import { useNavigate } from "@tanstack/react-router";
import { cn } from "cn";
import { Check, Keyboard, Layers, Settings } from "lucide-react";
import { useState } from "react";
import { useMediaFilesByEpisode, useMediaFilesByMetadata } from "@/client/hooks/use-media";
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
import { detach } from "../utils/player-utils";
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

/** Available playback speed steps (mirrors what Vidstack SpeedSlider offered). */
const SPEED_STEPS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;

function versionLabel(edition: string | null | undefined, qualityTag: string | null | undefined, index: number): string {
	const trimmedEdition = edition?.trim();
	if (trimmedEdition !== undefined && trimmedEdition.length > 0) return trimmedEdition;

	return qualityTag ? m.web_episode_version_version({ qualityTag }) : m.web_episode_release_number({ number: index + 1 });
}

export function PlayerSettingsMenu({
	onOpenShortcuts,
	shortcutsDisabled = false,
	onShortcutsDisabledChange,
}: {
	onOpenShortcuts?: () => void;
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

	const { data: episodeFiles = [] } = useMediaFilesByEpisode(info.episodeId, { enabled: isMenuOpen });
	const { data: metadataFiles = [] } = useMediaFilesByMetadata(!info.episodeId ? info.metadataId : null, { enabled: isMenuOpen });
	const availableVersions = info.episodeId ? episodeFiles : metadataFiles;

	const activeQualityLabel = QUALITY_OPTIONS.find((option) => option.bitrate === maxBitrate)?.label ?? m.player_quality_auto();

	// Percentage fill for the speed slider (0 → SPEED_STEPS[0], 100 → SPEED_STEPS.last)
	const speedMin = SPEED_STEPS[0]; // 0.25 — always defined (const tuple)
	const speedMax = 2 as const; // SPEED_STEPS last element — matches tuple type
	const speedFillPercent = ((playbackRate - speedMin) / (speedMax - speedMin)) * 100;

	const selectVersion = (newId: string) => {
		if (newId && newId !== info.mediaFileId) {
			detach(() => navigate({ to: "/player/$id", params: { id: newId } }));
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
								const label = versionLabel(file.edition, file.qualityTag, idx);
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
						<div className="relative mx-1 flex h-8 items-center">
							<div className="relative z-0 h-1.25 w-full rounded-sm bg-foreground/30">
								<div
									className="absolute inset-y-0 left-0 rounded-sm bg-primary transition-[width]"
									style={{ width: `${speedFillPercent}%` }}
								/>
								<div className="absolute inset-0 flex items-center justify-between px-0">
									{SPEED_STEPS.map((step) => (
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
								onChange={(e) => actions.setPlaybackRate(Number(e.target.value))}
							/>
						</div>
					</section>

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
								<DropdownMenuRadioGroup
									value={info.mediaFileId}
									onValueChange={(newId) => {
										const targetId = String(newId);
										if (targetId && targetId !== info.mediaFileId) {
											detach(() => navigate({ to: "/player/$id", params: { id: targetId } }));
										}
									}}
								>
									<DropdownMenuLabel className="flex items-center gap-1.5 font-bold text-muted-foreground text-xs uppercase tracking-wider">
										<Layers className="size-3.5 text-primary" />
										<span>{m.player_version_named({ count: availableVersions.length })}</span>
									</DropdownMenuLabel>
									{availableVersions.map((file, idx) => {
										const label = versionLabel(file.edition, file.qualityTag, idx);
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

						<DropdownMenuRadioGroup
							value={maxBitrate ? String(maxBitrate) : "auto"}
							onValueChange={(value) => onQualityChange(value === "auto" ? undefined : Number(value))}
						>
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
								{/* Native speed slider — steps at SPEED_STEPS */}
								<div className="relative flex h-8 w-full items-center">
									{/* Track background */}
									<div className="relative z-0 h-1.25 w-full rounded-sm bg-foreground/30">
										{/* Filled portion */}
										<div
											className="absolute inset-y-0 left-0 rounded-sm bg-primary transition-[width]"
											style={{ width: `${speedFillPercent}%` }}
										/>
										{/* Step markers */}
										<div className="absolute inset-0 flex items-center justify-between px-0">
											{SPEED_STEPS.map((step) => (
												<div key={step} className="h-1.5 w-0.5 bg-muted-foreground opacity-60" />
											))}
										</div>
									</div>
									{/* Invisible range input on top */}
									<input
										type="range"
										min={speedMin}
										max={speedMax}
										step={0.25}
										value={playbackRate}
										aria-label={m.player_speed_playback_playbackrate_2({ playbackRate })}
										className="absolute inset-0 z-10 h-full w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-progress]:bg-transparent [&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-foreground [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-border [&::-webkit-slider-thumb]:bg-foreground"
										onChange={(e) => actions.setPlaybackRate(Number(e.target.value))}
									/>
								</div>
							</div>
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
