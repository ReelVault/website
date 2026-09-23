import { cn } from "cn";
import { Check, Moon, RotateCcw, Sliders } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useIsMobile } from "@/hooks/use-mobile";
import { m } from "@/paraglide/messages";
import { usePlayerActions, usePlayerVolume } from "../player-context";
import {
	applyAudioPipeline,
	EQUALIZER_BANDS,
	EQUALIZER_PRESETS,
	type EqualizerConfig,
	type EqualizerPresetId,
	getStoredEqualizerConfig,
	isEqualizerActive,
	saveStoredEqualizerConfig,
} from "../utils/player-audio-boost";

const BAND_DESCRIPTIONS: Record<string, string> = {
	"60 Hz": m.player_preset_deep_bass(),
	"250 Hz": m.player_preset_warmth_rhythm(),
	"1 kHz": m.player_preset_speech_clarity(),
	"4 kHz": m.player_eq_presence(),
	"12 kHz": m.player_eq_sopranos(),
};

export function PlayerEqualizerPanel() {
	const actions = usePlayerActions();
	const isMobile = useIsMobile();
	const { volume } = usePlayerVolume();
	const [config, setConfig] = useState<EqualizerConfig>(getStoredEqualizerConfig);
	// Stable handle so the Web Audio graph is touched from commit paths only.
	const actionsRef = useRef(actions);
	useEffect(() => {
		actionsRef.current = actions;
	}, [actions]);

	const updatePipeline = (nextConfig: EqualizerConfig) => {
		setConfig(nextConfig);
		saveStoredEqualizerConfig(nextConfig);
		const video = actionsRef.current.videoRef.current;
		if (video) {
			video.volume = 1;
			applyAudioPipeline(video, volume, nextConfig);
		}
	};

	const selectPreset = (presetId: EqualizerPresetId) => {
		const preset = EQUALIZER_PRESETS.find((p) => p.id === presetId);
		if (!preset) return;

		updatePipeline({
			preset: preset.id,
			gains: [...preset.gains],
			compressorEnabled: preset.compressor,
		});
	};

	const toggleCompressor = (enabled: boolean) => {
		updatePipeline({
			...config,
			preset: "custom",
			compressorEnabled: enabled,
		});
	};

	const updateBand = (index: number, val: number) => {
		const nextGains = [...config.gains] as [number, number, number, number, number];
		nextGains[index] = val;
		updatePipeline({
			preset: "custom",
			gains: nextGains,
			compressorEnabled: config.compressorEnabled,
		});
	};

	const resetEqualizer = () => {
		selectPreset("flat");
	};

	const active = isEqualizerActive(config);

	return (
		<div className="space-y-6 py-1">
			{/* Top Header & Reset */}
			<div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/40 bg-muted/40 p-4">
				<div className="space-y-0.5">
					<div className="flex items-center gap-2">
						<Sliders className="size-4 text-primary" />
						<h3 className="font-semibold text-foreground text-sm">{m.player_equalizer_compressor()}</h3>
						<Badge variant={active ? "default" : "secondary"} className="text-[10px]">
							{active ? m.player_active_direct_play() : m.player_bypass_original()}
						</Badge>
					</div>
					<p className="text-muted-foreground text-xs">{m.player_works_in_browser_note()}</p>
				</div>
				<Button type="button" variant="outline" size="sm" onClick={resetEqualizer} disabled={!active} className="h-8 gap-1.5 text-xs">
					<RotateCcw className="size-3.5" />
					{m.player_reset_to_zero()}
				</Button>
			</div>

			{/* Presets Grid */}
			<div className="space-y-2">
				<span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">{m.player_ready_profiles()}</span>
				<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
					{EQUALIZER_PRESETS.map((p) => {
						const isSelected = config.preset === p.id;

						return (
							<button
								key={p.id}
								type="button"
								onClick={() => selectPreset(p.id)}
								className={cn(
									"flex flex-col items-start rounded-lg border p-3 text-left transition-colors",
									isSelected
										? "border-primary/80 bg-primary/10 text-foreground shadow-xs ring-1 ring-primary/30"
										: "border-border/40 bg-muted/20 text-muted-foreground hover:border-border hover:bg-muted/40 hover:text-foreground",
								)}
							>
								<div className="flex w-full items-center justify-between gap-1 font-medium text-xs">
									<span className={cn(isSelected && "font-semibold text-primary")}>{p.label}</span>
									{isSelected && <Check className="size-3.5 shrink-0 text-primary" />}
								</div>
								<span className="mt-1 line-clamp-2 text-[11px] text-muted-foreground leading-tight">{p.description}</span>
							</button>
						);
					})}
				</div>
			</div>

			{/* Dynamics Compressor Card */}
			<div className="flex items-center justify-between gap-4 rounded-lg border border-border/40 bg-muted/20 p-4 transition-colors hover:border-border/80">
				<div className="flex items-start gap-3">
					<div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
						<Moon className="size-4" />
					</div>
					<div className="space-y-1">
						<div className="flex items-center gap-2">
							<span className="font-semibold text-foreground text-sm">{m.player_compressor_night_mode()}</span>
							{config.compressorEnabled && (
								<Badge variant="outline" className="border-primary/40 text-[10px] text-primary">
									{m.admin_resources_enabled()}
								</Badge>
							)}
						</div>
						<p className="text-muted-foreground text-xs leading-relaxed">{m.player_compressor_night_desc()}</p>
					</div>
				</div>
				<Switch checked={config.compressorEnabled} onCheckedChange={toggleCompressor} aria-label={m.player_enable_compressor()} />
			</div>

			{/* Equalizer Frequency Sliders */}
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">{m.player_eq_bands_label()}</span>

					{config.preset === "custom" && <span className="font-mono text-[11px] text-muted-foreground">{m.player_manual_profile()}</span>}
				</div>

				<div className="grid grid-cols-1 gap-3 rounded-lg border border-border/40 bg-muted/10 p-4 sm:grid-cols-5 sm:gap-4">
					{EQUALIZER_BANDS.map((band, index) => {
						const gain = config.gains[index] ?? 0;
						const displayGain = gain > 0 ? `+${gain} dB` : `${gain} dB`;
						const desc = BAND_DESCRIPTIONS[band.label] ?? "";

						return (
							<div
								key={band.label}
								className="flex flex-col items-center justify-between rounded-md border border-border/20 bg-background/50 p-3"
							>
								{/* Band label & subtext */}
								<div className="text-center">
									<span className="font-mono font-semibold text-foreground text-xs">{band.label}</span>
									<p className="text-[10px] text-muted-foreground">{desc}</p>
								</div>

								{/* Vertical Slider on desktop / Horizontal on mobile */}
								<div className={cn("flex w-full items-center justify-center", isMobile ? "h-10" : "my-3 h-32 sm:h-36")}>
									<Slider
										orientation={isMobile ? "horizontal" : "vertical"}
										value={[gain]}
										min={-12}
										max={12}
										step={1}
										onValueChange={(val) => {
											const next: unknown = Array.isArray(val) ? val[0] : val;
											updateBand(index, Number(next));
										}}
										className={isMobile ? "w-full" : "h-full"}
										aria-label={m.player_eq_band({ band: band.label })}
									/>
								</div>

								{/* Gain readout badge */}
								<span
									className={cn(
										"rounded-sm px-1.5 py-0.5 font-mono text-[11px]",
										gain > 0 ? "bg-primary/20 font-semibold text-primary" : "bg-muted text-muted-foreground",
									)}
								>
									{displayGain}
								</span>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
