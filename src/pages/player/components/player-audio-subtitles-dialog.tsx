import { cn } from "cn";
import { Check, Eye, EyeOff, Minus, Plus, RotateCcw, Search, SlidersHorizontal, Subtitles, Timer } from "lucide-react";
import { useCallback, useState } from "react";
import {
	FullscreenDialog,
	FullscreenDialogContent,
	FullscreenDialogDescription,
	FullscreenDialogHeader,
	FullscreenDialogTitle,
	FullscreenDialogTrigger,
} from "@/components/fullscreen-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { m } from "@/paraglide/messages";
import { getLocaleTag } from "@/utils/format-utils";
import { useClientCapabilities } from "../hooks/use-client-capabilities";
import { usePlayerSettings, usePlayerSubtitles } from "../player-context";
import {
	isBitmapSubtitle,
	type SubtitleBackground,
	type SubtitleColor,
	type SubtitlePosition,
	type SubtitleSize,
} from "../utils/player.types";
import { detach } from "../utils/player-utils";
import { PlayerControlButton } from "./player-control-button";
import { PlayerEqualizerPanel } from "./player-equalizer-panel";
import { PlayerSubtitleSearchPanel } from "./player-subtitle-search-panel";

let languageDisplayNames: Intl.DisplayNames | undefined;
try {
	languageDisplayNames = new Intl.DisplayNames([getLocaleTag()], { type: "language" });
} catch {
	// Intl.DisplayNames unavailable — falls back to uppercased codes.
}

function formatSubtitleLanguage(code: string | null | undefined): string {
	if (!code || code === "und") return m.player_subtitles_word();

	try {
		return languageDisplayNames?.of(code.toLowerCase()) ?? code.toUpperCase();
	} catch {
		return code.toUpperCase();
	}
}

function formatSubtitleLabel(subtitle: {
	language: string;
	label?: string | null;
	type?: "embedded" | "external";
	format?: string;
	isDefault?: boolean;
	isForced?: boolean;
	isHearingImpaired?: boolean;
}): string {
	const lang = formatSubtitleLanguage(subtitle.language);
	const base = subtitle.label ? `${subtitle.label} [${lang}]` : lang;
	const tags: string[] = [];
	if (subtitle.isForced) tags.push(m.player_forced_word());

	if (subtitle.isDefault) tags.push(m.admin_subtitles_default());

	if (subtitle.isHearingImpaired) tags.push(m.player_sdh_word());

	if (isBitmapSubtitle(subtitle.format)) tags.push(m.player_graphic_word());
	else if (subtitle.type === "embedded") tags.push(m.player_builtin_word());

	return tags.length > 0 ? `${base} (${tags.join(", ")})` : base;
}

const isSubtitleCompatible = (subtitle: { format?: string }) => !isBitmapSubtitle(subtitle.format);

function formatAudioLabel(stream: { language?: string | null; title?: string | null }): string {
	const lang = stream.language ? formatSubtitleLanguage(stream.language) : m.player_default_track();

	return stream.title ? `${lang} (${stream.title})` : lang;
}

const SUBTITLE_PREVIEW_SIZES: Record<SubtitleSize, string> = {
	small: "0.875rem",
	normal: "1rem",
	large: "1.125rem",
	"extra-large": "1.25rem",
};

const SUBTITLE_SIZES: Array<{ value: SubtitleSize; readonly label: string }> = [
	{
		value: "small",
		get label() {
			return m.admin_users_size_small();
		},
	},
	{
		value: "normal",
		get label() {
			return m.player_subtitles_size_normal();
		},
	},
	{
		value: "large",
		get label() {
			return m.admin_users_size_large();
		},
	},
	{
		value: "extra-large",
		get label() {
			return m.admin_users_size_very_large();
		},
	},
];

const SUBTITLE_POSITIONS: Array<{ value: SubtitlePosition; readonly label: string }> = [
	{
		value: "bottom",
		get label() {
			return m.admin_users_position_bottom();
		},
	},
	{
		value: "top",
		get label() {
			return m.admin_users_position_top();
		},
	},
	{
		value: "middle",
		get label() {
			return m.admin_users_position_middle();
		},
	},
];

const SUBTITLE_COLORS: Array<{ value: SubtitleColor; readonly label: string; colorClass: string }> = [
	{
		value: "white",
		get label() {
			return m.admin_users_color_white();
		},
		colorClass: "bg-white text-black",
	},
	{
		value: "yellow",
		get label() {
			return m.admin_users_color_yellow();
		},
		colorClass: "bg-amber-300 text-black",
	},
	{
		value: "cyan",
		get label() {
			return m.admin_users_color_light_blue();
		},
		colorClass: "bg-cyan-300 text-black",
	},
	{
		value: "green",
		get label() {
			return m.player_subtitles_color_green();
		},
		colorClass: "bg-emerald-300 text-black",
	},
];

const SUBTITLE_BACKGROUNDS: Array<{ value: SubtitleBackground; readonly label: string }> = [
	{
		value: "semi",
		get label() {
			return m.admin_users_bg_semi_transparent();
		},
	},
	{
		value: "none",
		get label() {
			return m.admin_users_no_background();
		},
	},
	{
		value: "solid",
		get label() {
			return m.admin_users_bg_opaque_black();
		},
	},
];

/**
 * Hides incompatible tracks while at least one compatible one exists.
 * When none are compatible, or the user enables the preview, all are shown.
 */
function splitByCompatibility<T>(items: T[], isCompatible: (item: T) => boolean): { visible: T[]; hiddenCount: number } {
	const compatible = items.filter((item) => isCompatible(item));
	const incompatibleCount = items.length - compatible.length;
	if (incompatibleCount === 0 || compatible.length === 0) return { visible: items, hiddenCount: 0 };

	return { visible: compatible, hiddenCount: incompatibleCount };
}

function Kbd({ children }: { children: string }) {
	return <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono font-semibold text-[11px] text-foreground">{children}</kbd>;
}

function CompatibilityToggleButton({
	hiddenCount,
	isShown,
	onToggle,
	label,
}: {
	hiddenCount: number;
	isShown: boolean;
	onToggle: () => void;
	label: string;
}) {
	return (
		<Button
			type="button"
			variant="ghost"
			size="icon-sm"
			className="size-8 text-muted-foreground hover:text-foreground"
			onClick={onToggle}
			title={isShown ? m.player_hide_incompatible({ label }) : m.player_show_incompatible({ hiddenCount })}
			aria-label={isShown ? m.player_hide_incompatible({ label }) : m.player_show_incompatible({ hiddenCount })}
			aria-pressed={isShown}
		>
			{isShown ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
		</Button>
	);
}

export function PlayerAudioSubtitlesDialog() {
	const { audioStreams, selectedAudioStream, onAudioStreamChange } = usePlayerSettings();
	const capabilities = useClientCapabilities();
	const {
		subtitles,
		selectedSubtitleId,
		setSelectedSubtitleId,
		subtitleSize,
		subtitlePosition,
		subtitleColor,
		subtitleBackground,
		updateSubtitlePreferences,
		subtitleOffset,
		setSubtitleOffset,
		adjustSubtitleOffset,
	} = usePlayerSubtitles();

	// Stable render prop for the shortcut hint — avoids unstable inline components.
	const renderKbd = useCallback((chunks: string) => <Kbd>{chunks}</Kbd>, []);

	const [isOpen, setIsOpen] = useState(false);
	const [activeTab, setActiveTab] = useState<"media" | "equalizer" | "styling" | "sync" | "search">("media");
	const [showIncompatibleAudio, setShowIncompatibleAudio] = useState(false);
	const [showIncompatibleSubtitles, setShowIncompatibleSubtitles] = useState(false);

	const isAudioCompatible = (stream: { codecName?: string | null }) =>
		Boolean(capabilities?.audioCodecs.some((c) => c.toLowerCase() === stream.codecName?.toLowerCase()));

	const audioSplit = splitByCompatibility(audioStreams, isAudioCompatible);
	const visibleAudioStreams = showIncompatibleAudio ? audioStreams : audioSplit.visible;
	const hasHiddenAudio = audioSplit.hiddenCount > 0;

	const subtitleSplit = splitByCompatibility(subtitles, isSubtitleCompatible);
	const visibleSubtitles = showIncompatibleSubtitles ? subtitles : subtitleSplit.visible;
	const hasHiddenSubtitles = subtitleSplit.hiddenCount > 0;

	let offsetStatus: string;
	if (subtitleOffset === 0) offsetStatus = m.player_subtitles_in_sync();
	else if (subtitleOffset > 0) offsetStatus = m.player_subtitles_delayed();
	else offsetStatus = m.player_subtitles_early();

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open);
		if (open) {
			// Incompatible tracks default back to hidden on every open.
			setShowIncompatibleAudio(false);
			setShowIncompatibleSubtitles(false);
		}
	};

	return (
		<FullscreenDialog open={isOpen} onOpenChange={handleOpenChange}>
			<PlayerControlButton
				description={m.player_audio_subtitles()}
				render={<FullscreenDialogTrigger aria-label={m.player_audio_subtitles()} />}
			>
				<Subtitles className="size-5" aria-hidden="true" />
			</PlayerControlButton>

			<FullscreenDialogContent className="max-h-[85vh] w-full max-w-4xl border-border/40 bg-background/95 p-6 shadow-2xl md:p-8">
				<FullscreenDialogHeader className="mb-3">
					<FullscreenDialogTitle className="font-bold text-xl">{m.player_audio_subtitles()}</FullscreenDialogTitle>
					<FullscreenDialogDescription className="text-muted-foreground text-xs">
						{m.player_pick_preferred_tracks()}
					</FullscreenDialogDescription>
				</FullscreenDialogHeader>

				<Tabs
					value={activeTab}
					onValueChange={(val) => {
						const tab = String(val);
						if (tab === "media" || tab === "equalizer" || tab === "styling" || tab === "sync" || tab === "search") {
							setActiveTab(tab);
						}
					}}
					className="w-full"
				>
					<TabsList className="mb-4 w-fit bg-muted/60">
						<TabsTrigger value="media">{m.player_tracks_subtitles()}</TabsTrigger>
						<TabsTrigger value="equalizer">{m.player_audio_equalizer()}</TabsTrigger>
						<TabsTrigger value="sync">
							{m.player_sync_heading()}
							{subtitleOffset !== 0 && (
								<span className="ml-1.5 rounded bg-primary/20 px-1 py-0.2 font-mono text-[10px] text-primary">
									{subtitleOffset > 0 ? `+${subtitleOffset.toFixed(1)}s` : `${subtitleOffset.toFixed(1)}s`}
								</span>
							)}
						</TabsTrigger>
						<TabsTrigger value="styling">{m.player_style_position_tab()}</TabsTrigger>
						<TabsTrigger value="search">{m.player_search_online()}</TabsTrigger>
					</TabsList>

					{/* Main two-column view: audio on the left, subtitles on the right */}
					<TabsContent value="media" className="mt-0 outline-none">
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10">
							{/* Left column: audio */}
							<div className="flex flex-col">
								<div className="flex items-center justify-between gap-2">
									<div className="flex-1 rounded-md bg-muted/80 px-4 py-2 text-center font-semibold text-foreground text-sm tracking-wide shadow-xs">
										{m.player_audio_col()}
									</div>
									{hasHiddenAudio && (
										<CompatibilityToggleButton
											hiddenCount={audioSplit.hiddenCount}
											isShown={showIncompatibleAudio}
											onToggle={() => setShowIncompatibleAudio((value) => !value)}
											label={m.player_audio_tracks_word()}
										/>
									)}
								</div>
								<div className="custom-scrollbar mt-3 max-h-[48vh] divide-y divide-border/15 overflow-y-auto pr-1">
									{visibleAudioStreams.length === 0 ? (
										<div className="py-8 text-center text-muted-foreground text-sm">{m.player_no_alternative_audio()}</div>
									) : (
										visibleAudioStreams.map((stream) => {
											const isSelected = selectedAudioStream?.index === stream.index;
											const isDirectCompatible = isAudioCompatible(stream);

											return (
												<button
													key={stream.index}
													type="button"
													onClick={() => onAudioStreamChange(stream.index)}
													className={cn(
														"group flex w-full items-center gap-3 px-3 py-3 text-left text-sm transition-colors hover:bg-muted/40",
														isSelected ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground",
													)}
												>
													<div className="flex size-4 shrink-0 items-center justify-center">
														{isSelected ? <Check className="size-4 text-primary" /> : null}
													</div>
													<div className="flex min-w-0 flex-1 items-center justify-between gap-2">
														<div className="flex min-w-0 items-center gap-1.5 truncate">
															<span className="truncate">{formatAudioLabel(stream)}</span>
															{isDirectCompatible ? (
																<Badge
																	variant="outline"
																	className="shrink-0 border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0 text-[10px] text-emerald-500"
																>
																	{m.player_best_compat()}
																</Badge>
															) : (
																<Badge
																	variant="outline"
																	className="shrink-0 border-amber-500/30 bg-amber-500/10 px-1.5 py-0 text-[10px] text-amber-500"
																>
																	{m.player_needs_transcoding()}
																</Badge>
															)}
														</div>
														{(stream.codecName || (stream.channelLayout ?? stream.channels)) && (
															<span className="shrink-0 font-mono text-muted-foreground/70 text-xs">
																{stream.codecName.toUpperCase()} {stream.channelLayout ?? (stream.channels ? `${stream.channels}ch` : "")}
															</span>
														)}
													</div>
												</button>
											);
										})
									)}
								</div>
							</div>

							{/* Right column: subtitles */}
							<div className="flex flex-col">
								<div className="flex items-center justify-between gap-2">
									<div className="flex-1 rounded-md bg-muted/80 px-4 py-2 text-center font-semibold text-foreground text-sm tracking-wide shadow-xs">
										{m.admin_nav_subtitles()}
									</div>
									{hasHiddenSubtitles && (
										<CompatibilityToggleButton
											hiddenCount={subtitleSplit.hiddenCount}
											isShown={showIncompatibleSubtitles}
											onToggle={() => setShowIncompatibleSubtitles((value) => !value)}
											label={m.player_subtitles_word()}
										/>
									)}
								</div>
								<div className="custom-scrollbar mt-3 max-h-[48vh] divide-y divide-border/15 overflow-y-auto pr-1">
									{/* Disabled */}
									<button
										type="button"
										onClick={() => setSelectedSubtitleId(undefined)}
										className={cn(
											"group flex w-full items-center gap-3 px-3 py-3 text-left text-sm transition-colors hover:bg-muted/40",
											!selectedSubtitleId ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground",
										)}
									>
										<div className="flex size-4 shrink-0 items-center justify-center">
											{!selectedSubtitleId ? <Check className="size-4 text-primary" /> : null}
										</div>
										<span>{m.common_disabled()}</span>
									</button>

									{/* Subtitle track list */}
									{visibleSubtitles.map((subtitle) => {
										const isBitmap = isBitmapSubtitle(subtitle.format);
										const isSelected = selectedSubtitleId === subtitle.id;

										return (
											<button
												key={subtitle.id}
												type="button"
												disabled={isBitmap}
												onClick={() => setSelectedSubtitleId(subtitle.id)}
												className={cn(
													"group flex w-full items-center gap-3 px-3 py-3 text-left text-sm transition-colors hover:bg-muted/40",
													isSelected ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground",
													isBitmap && "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-muted-foreground",
												)}
												title={isBitmap ? m.player_pgs_vobsub_unsupported() : undefined}
											>
												<div className="flex size-4 shrink-0 items-center justify-center">
													{isSelected ? <Check className="size-4 text-primary" /> : null}
												</div>
												<div className="flex min-w-0 flex-1 items-center justify-between gap-2">
													<span className="truncate">{formatSubtitleLabel(subtitle)}</span>
												</div>
											</button>
										);
									})}
								</div>

								{/* Szybkie akcje pod napisami */}
								<div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-border/30 border-t pt-3">
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="text-muted-foreground text-xs hover:text-foreground"
										onClick={() => setActiveTab("styling")}
									>
										<SlidersHorizontal className="mr-1.5 size-3.5" />
										{m.player_sub_style_position()}
									</Button>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="text-muted-foreground text-xs hover:text-foreground"
										onClick={() => setActiveTab("search")}
									>
										<Search className="mr-1.5 size-3.5" />
										{m.player_subtitles_search_online()}
									</Button>
								</div>
							</div>
						</div>
					</TabsContent>

					{/* Audio equalizer and compressor tab */}
					<TabsContent value="equalizer" className="mt-0 outline-none">
						{/* TODO: fix */}
						<ScrollArea className="h-102">
							<PlayerEqualizerPanel />
						</ScrollArea>
					</TabsContent>

					{/* Subtitle styling and position tab */}
					<TabsContent value="styling" className="mt-0 space-y-5 py-1 outline-none">
						<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
							{/* Size */}
							<div className="space-y-2">
								<h4 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">{m.player_size()}</h4>
								<div className="flex flex-col gap-1.5">
									{SUBTITLE_SIZES.map((option) => (
										<Button
											key={option.value}
											type="button"
											aria-pressed={subtitleSize === option.value}
											variant={subtitleSize === option.value ? "default" : "outline"}
											size="sm"
											className="justify-start text-xs"
											onClick={() => detach(() => updateSubtitlePreferences({ subtitleSize: option.value }))}
										>
											{option.label}
										</Button>
									))}
								</div>
							</div>

							{/* Pozycja */}
							<div className="space-y-2">
								<h4 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">{m.player_position_heading()}</h4>
								<div className="flex flex-col gap-1.5">
									{SUBTITLE_POSITIONS.map((option) => (
										<Button
											key={option.value}
											type="button"
											aria-pressed={subtitlePosition === option.value}
											variant={subtitlePosition === option.value ? "default" : "outline"}
											size="sm"
											className="justify-start text-xs"
											onClick={() => detach(() => updateSubtitlePreferences({ subtitlePosition: option.value }))}
										>
											{option.label}
										</Button>
									))}
								</div>
							</div>

							{/* Text color */}
							<div className="space-y-2">
								<h4 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">{m.player_text_color()}</h4>
								<div className="flex flex-col gap-1.5">
									{SUBTITLE_COLORS.map((option) => (
										<Button
											key={option.value}
											type="button"
											aria-pressed={subtitleColor === option.value}
											variant={subtitleColor === option.value ? "default" : "outline"}
											size="sm"
											className="justify-start text-xs"
											onClick={() => detach(() => updateSubtitlePreferences({ subtitleColor: option.value }))}
										>
											<span className={cn("mr-2 size-2.5 rounded-full border border-black/20", option.colorClass)} />
											{option.label}
										</Button>
									))}
								</div>
							</div>

							{/* Background style */}
							<div className="space-y-2">
								<h4 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">{m.user_background_style()}</h4>
								<div className="flex flex-col gap-1.5">
									{SUBTITLE_BACKGROUNDS.map((option) => (
										<Button
											key={option.value}
											type="button"
											aria-pressed={subtitleBackground === option.value}
											variant={subtitleBackground === option.value ? "default" : "outline"}
											size="sm"
											className="justify-start text-xs"
											onClick={() => detach(() => updateSubtitlePreferences({ subtitleBackground: option.value }))}
										>
											{option.label}
										</Button>
									))}
								</div>
							</div>
						</div>

						{/* Live preview */}
						<div className="relative flex h-28 w-full items-center justify-center rounded-xl border border-border/50 bg-black/90 p-4 shadow-inner">
							<span className="absolute top-2.5 left-3 font-mono text-[10px] text-muted-foreground/60 uppercase tracking-wider">
								{m.player_live_preview()}
							</span>
							<span
								className={cn(
									"px-3 py-1 font-semibold transition-[border-color,background-color,color,box-shadow]",
									subtitleColor === "white" && "text-white",
									subtitleColor === "yellow" && "text-amber-300",
									subtitleColor === "cyan" && "text-cyan-300",
									subtitleColor === "green" && "text-emerald-300",
									subtitleBackground === "semi" && "rounded bg-black/70",
									subtitleBackground === "solid" && "rounded bg-black",
									subtitleBackground === "none" && "bg-transparent shadow-[0_2px_4px_rgba(0,0,0,0.9)]",
								)}
								style={{ fontSize: SUBTITLE_PREVIEW_SIZES[subtitleSize] }}
							>
								{m.player_sample_subtitle_player()}
							</span>
						</div>
					</TabsContent>

					{/* Subtitle sync tab */}
					<TabsContent value="sync" className="mt-0 space-y-6 py-2 outline-none">
						<div className="flex flex-col gap-6">
							{/* Current offset preview */}
							<div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-muted/40 p-6 text-center shadow-xs">
								<span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									{m.player_subtitle_offset_field()}
								</span>
								<div className="mt-2 flex items-baseline gap-1">
									<span className="font-black font-mono text-4xl text-primary tracking-tight">
										{subtitleOffset > 0 ? `+${subtitleOffset.toFixed(1)}` : subtitleOffset.toFixed(1)}
									</span>
									<span className="font-semibold text-lg text-muted-foreground">{m.player_seconds_word()}</span>
								</div>
								<p className="mt-2 max-w-md text-muted-foreground text-xs">{offsetStatus}</p>
							</div>

							{/* Quick adjustment buttons */}
							<div className="space-y-2">
								<h4 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">{m.player_quick_fix()}</h4>
								<div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
									<Button
										type="button"
										variant="outline"
										size="sm"
										className="h-9 gap-1 text-xs"
										onClick={() => adjustSubtitleOffset(-1.0)}
										aria-label={m.player_delay_minus_1()}
									>
										<Minus className="size-3 text-destructive" /> {m.player_delay_1_second()}
									</Button>
									<Button
										type="button"
										variant="outline"
										size="sm"
										className="h-9 gap-1 text-xs"
										onClick={() => adjustSubtitleOffset(-0.1)}
										aria-label={m.player_delay_minus_point1()}
									>
										<Minus className="size-3 text-destructive" /> {m.player_delay_point_1_second()}
									</Button>
									<Button
										type="button"
										variant={subtitleOffset === 0 ? "secondary" : "outline"}
										size="sm"
										className="col-span-2 h-9 gap-1 font-semibold text-xs sm:col-span-1"
										onClick={() => setSubtitleOffset(0)}
										disabled={subtitleOffset === 0}
									>
										<RotateCcw className="size-3" /> {m.player_reset_zero()}
									</Button>
									<Button
										type="button"
										variant="outline"
										size="sm"
										className="h-9 gap-1 text-xs"
										onClick={() => adjustSubtitleOffset(0.1)}
										aria-label={m.player_delay_plus_point1()}
									>
										<Plus className="size-3 text-emerald-400" /> {m.player_delay_point_1_second()}
									</Button>
									<Button
										type="button"
										variant="outline"
										size="sm"
										className="h-9 gap-1 text-xs"
										onClick={() => adjustSubtitleOffset(1.0)}
										aria-label={m.player_delay_plus_1()}
									>
										<Plus className="size-3 text-emerald-400" /> {m.player_delay_1_second()}
									</Button>
								</div>
							</div>

							{/* Smooth slider */}
							<div className="space-y-3 pt-2">
								<div className="flex justify-between text-muted-foreground text-xs">
									<span>{m.player_seek_earlier_10s()}</span>
									<span>{m.player_offset_zero()}</span>
									<span>{m.player_seek_later_10s()}</span>
								</div>
								<Slider
									min={-10}
									max={10}
									step={0.1}
									aria-label={m.player_subtitle_offset_field()}
									value={[subtitleOffset]}
									onValueChange={(val) => {
										const next: unknown = Array.isArray(val) ? val[0] : val;
										if (typeof next === "number") {
											setSubtitleOffset(Math.round(next * 10) / 10);
										}
									}}
								/>
							</div>

							{/* Keyboard shortcut hint */}
							<div className="rounded-xl border border-border/40 bg-card/40 p-4 text-muted-foreground text-xs">
								<div className="flex items-center gap-2 font-medium text-foreground">
									<Timer className="size-4 text-primary" />
									<span>{m.player_shortcuts_on_the_fly()}</span>
								</div>
								<p className="mt-1 leading-relaxed">{m.player_shortcuts_subtitle_timing_hint({ g: renderKbd, h: renderKbd })}</p>
							</div>
						</div>
					</TabsContent>

					{/* Online subtitle search tab */}
					<TabsContent value="search" className="mt-0 py-2 outline-none">
						<PlayerSubtitleSearchPanel />
					</TabsContent>
				</Tabs>
			</FullscreenDialogContent>
		</FullscreenDialog>
	);
}
