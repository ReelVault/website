import { m } from "@/paraglide/messages";
import { detach } from "./player-utils";

export const MAX_PLAYER_VOLUME = 2;

export type EqualizerPresetId = "flat" | "dialogue" | "night" | "bass" | "treble" | "cinema" | "custom";

export interface EqualizerBandDefinition {
	frequency: number;
	type: BiquadFilterType;
	label: string;
	q?: number;
}

export const EQUALIZER_BANDS: readonly EqualizerBandDefinition[] = [
	{ frequency: 60, type: "lowshelf", label: "60 Hz" },
	{ frequency: 250, type: "peaking", label: "250 Hz", q: 1.0 },
	{ frequency: 1000, type: "peaking", label: "1 kHz", q: 1.0 },
	{ frequency: 4000, type: "peaking", label: "4 kHz", q: 1.0 },
	{ frequency: 12000, type: "highshelf", label: "12 kHz" },
] as const;

export interface EqualizerPreset {
	id: EqualizerPresetId;
	label: string;
	description: string;
	gains: [number, number, number, number, number];
	compressor: boolean;
}

export const EQUALIZER_PRESETS: readonly EqualizerPreset[] = [
	{
		id: "flat",
		get label() {
			return m.plugins_webhooks_disabled();
		},
		get description() {
			return m.player_audio_original_note();
		},
		gains: [0, 0, 0, 0, 0],
		compressor: false,
	},
	{
		id: "dialogue",
		get label() {
			return m.player_preset_dialogue_boost();
		},
		get description() {
			return m.player_preset_dialogue_boost_desc();
		},
		gains: [-2, -1, 4, 3, 0],
		compressor: false,
	},
	{
		id: "night",
		get label() {
			return m.player_preset_night();
		},
		get description() {
			return m.player_compression_description();
		},
		gains: [-3, -1, 2, 1, -2],
		compressor: true,
	},
	{
		id: "bass",
		get label() {
			return m.player_preset_bass();
		},
		get description() {
			return m.player_preset_deep_bass_desc();
		},
		gains: [5, 3, 0, 0, 0],
		compressor: false,
	},
	{
		id: "treble",
		get label() {
			return m.player_preset_treble_boost();
		},
		get description() {
			return m.player_preset_treble_boost_desc();
		},
		gains: [0, 0, 0, 3, 5],
		compressor: false,
	},
	{
		id: "cinema",
		get label() {
			return m.player_preset_cinema();
		},
		get description() {
			return m.player_preset_cinema_desc();
		},
		gains: [3, 1, -1, 2, 3],
		compressor: false,
	},
	{
		id: "custom",
		get label() {
			return m.player_custom();
		},
		get description() {
			return m.player_manual_sliders_note();
		},
		gains: [0, 0, 0, 0, 0],
		compressor: false,
	},
] as const;

export interface EqualizerConfig {
	preset: EqualizerPresetId;
	gains: [number, number, number, number, number];
	compressorEnabled: boolean;
}

export const DEFAULT_EQUALIZER_CONFIG: EqualizerConfig = {
	preset: "flat",
	gains: [0, 0, 0, 0, 0],
	compressorEnabled: false,
};

export function isEqualizerActive(config: EqualizerConfig): boolean {
	return config.preset !== "flat" || config.compressorEnabled || config.gains.some((g) => Math.abs(g) > 0.01);
}

/** Clamp an equalizer gain (dB) into the supported range, coercing junk to 0. */
const clampGain = (n: unknown): number => Math.max(-12, Math.min(12, Number(n) || 0));

/** Validates a five-element gain list coming from the untyped localStorage boundary. */
function toGainTuple(value: unknown): [number, number, number, number, number] | null {
	const items: unknown[] = Array.isArray(value) ? value : [];
	if (items.length !== 5) return null;

	const [a, b, c, d, e] = items;

	return [clampGain(a), clampGain(b), clampGain(c), clampGain(d), clampGain(e)];
}

export function getStoredEqualizerConfig(): EqualizerConfig {
	if (typeof window === "undefined") return { ...DEFAULT_EQUALIZER_CONFIG };

	try {
		const storedPreset = window.localStorage.getItem("reelvault:player:eqPreset");
		const preset = EQUALIZER_PRESETS.find((p) => p.id === storedPreset)?.id ?? "flat";
		const compressorEnabled = window.localStorage.getItem("reelvault:player:eqCompressor") === "true";
		const rawGains = window.localStorage.getItem("reelvault:player:eqGains");
		let gains: [number, number, number, number, number] = [...DEFAULT_EQUALIZER_CONFIG.gains];
		if (rawGains) {
			const storedGains = toGainTuple(JSON.parse(rawGains));
			if (storedGains) {
				gains = storedGains;
			}
		} else {
			const matchingPreset = EQUALIZER_PRESETS.find((p) => p.id === preset);
			if (matchingPreset) gains = [...matchingPreset.gains];
		}

		return { preset, gains, compressorEnabled };
	} catch {
		return { ...DEFAULT_EQUALIZER_CONFIG };
	}
}

export function saveStoredEqualizerConfig(config: EqualizerConfig): void {
	if (typeof window === "undefined") return;

	try {
		window.localStorage.setItem("reelvault:player:eqPreset", config.preset);
		window.localStorage.setItem("reelvault:player:eqCompressor", String(config.compressorEnabled));
		window.localStorage.setItem("reelvault:player:eqGains", JSON.stringify(config.gains));
	} catch {
		// ignore
	}
}

interface AudioBoostNodes {
	ctx: AudioContext;
	sourceNode: MediaElementAudioSourceNode;
	filters: BiquadFilterNode[];
	compressorNode: DynamicsCompressorNode;
	gainNode: GainNode;
	isCompressorConnected: boolean;
}

const boostMap = new WeakMap<HTMLVideoElement, AudioBoostNodes>();

function routeCompressor(nodes: AudioBoostNodes, enable: boolean): void {
	if (nodes.isCompressorConnected === enable) return;

	const lastFilter = nodes.filters[nodes.filters.length - 1];
	if (!lastFilter) return;

	lastFilter.disconnect();
	if (enable) {
		lastFilter.connect(nodes.compressorNode);
		nodes.compressorNode.connect(nodes.gainNode);
	} else {
		try {
			nodes.compressorNode.disconnect();
		} catch {
			// ignore
		}

		lastFilter.connect(nodes.gainNode);
	}

	nodes.isCompressorConnected = enable;
}

/**
 * Ensures an AudioContext and processing graph are attached to the video element,
 * applying equalizer filter gains, compressor routing, and volume gain.
 */
function isAudioContextConstructor(value: unknown): value is typeof AudioContext {
	return typeof value === "function";
}

function getAudioContextConstructor(): typeof AudioContext | null {
	// Standard constructor first; older Safari exposes only the WebKit-prefixed one.
	const candidates: unknown[] = [window.AudioContext];
	if ("webkitAudioContext" in window) {
		candidates.push(window.webkitAudioContext);
	}

	for (const candidate of candidates) {
		if (isAudioContextConstructor(candidate)) return candidate;
	}

	return null;
}

function initAudioNodes(video: HTMLVideoElement): AudioBoostNodes | null {
	try {
		const AudioContextClass = getAudioContextConstructor();
		if (!AudioContextClass) return null;

		const ctx = new AudioContextClass();

		if (ctx.destination.maxChannelCount > 0) {
			try {
				ctx.destination.channelCount = ctx.destination.maxChannelCount;
				ctx.destination.channelInterpretation = "speakers";
			} catch {
				// Some browsers restrict channelCount reconfiguration
			}
		}

		const sourceNode = ctx.createMediaElementSource(video);
		const gainNode = ctx.createGain();

		const filters: BiquadFilterNode[] = [];
		for (const band of EQUALIZER_BANDS) {
			const filter = ctx.createBiquadFilter();
			filter.type = band.type;
			filter.frequency.value = band.frequency;
			if (band.q !== undefined) {
				filter.Q.value = band.q;
			}

			filter.gain.value = 0;
			filters.push(filter);
		}

		const firstFilter = filters[0];
		if (firstFilter) {
			sourceNode.connect(firstFilter);
			for (let i = 0; i < filters.length - 1; i++) {
				const current = filters[i];
				const next = filters[i + 1];
				if (current && next) {
					current.connect(next);
				}
			}
		}

		const compressorNode = ctx.createDynamicsCompressor();
		compressorNode.threshold.value = -20;
		compressorNode.knee.value = 10;
		compressorNode.ratio.value = 6;
		compressorNode.attack.value = 0.005;
		compressorNode.release.value = 0.08;

		const lastFilter = filters[filters.length - 1];
		if (lastFilter) {
			lastFilter.connect(gainNode);
		} else {
			sourceNode.connect(gainNode);
		}

		gainNode.connect(ctx.destination);

		const nodes: AudioBoostNodes = {
			ctx,
			sourceNode,
			filters,
			compressorNode,
			gainNode,
			isCompressorConnected: false,
		};
		boostMap.set(video, nodes);

		const resume = () => {
			if (nodes.ctx.state === "suspended") {
				detach(() => nodes.ctx.resume());
			}
		};

		window.addEventListener("pointerdown", resume, { capture: true, once: true });
		window.addEventListener("keydown", resume, { capture: true, once: true });
		video.addEventListener("play", resume, { once: true });

		return nodes;
	} catch (error) {
		console.warn("Failed to initialize Web Audio graph:", error);

		return null;
	}
}

export function isAudioPipelineActive(video: HTMLVideoElement): boolean {
	return boostMap.has(video);
}

/**
 * Ensures an AudioContext and processing graph are attached to the video element,
 * applying equalizer filter gains, compressor routing, and volume gain.
 */
export function applyAudioPipeline(video: HTMLVideoElement, volume: number, eqConfig?: EqualizerConfig): void {
	if (typeof window === "undefined") return;

	const config = eqConfig ?? getStoredEqualizerConfig();
	const eqActive = isEqualizerActive(config);
	let nodes = boostMap.get(video);

	if (!nodes && volume <= 1 && !eqActive) {
		return;
	}

	if (!nodes) {
		nodes = initAudioNodes(video) ?? undefined;
		if (!nodes) return;
	}

	if (nodes.ctx.state === "suspended") {
		detach(() => nodes.ctx.resume());
	}

	for (let i = 0; i < nodes.filters.length; i++) {
		const filter = nodes.filters[i];
		if (!filter) continue;

		const targetGain = Math.max(-12, Math.min(12, config.gains[i] ?? 0));
		try {
			filter.gain.setValueAtTime(targetGain, nodes.ctx.currentTime);
		} catch {
			filter.gain.value = targetGain;
		}
	}

	routeCompressor(nodes, config.compressorEnabled);

	// video.volume no longer has any effect once createMediaElementSource
	// has captured the element — gainNode is now the ONLY volume control.
	const clampedVolume = Math.max(0, Math.min(MAX_PLAYER_VOLUME, volume));
	try {
		nodes.gainNode.gain.setValueAtTime(clampedVolume, nodes.ctx.currentTime);
	} catch {
		nodes.gainNode.gain.value = clampedVolume;
	}
}

/** Legacy alias for volume-only callers */
export function applyAudioBoost(video: HTMLVideoElement, volume: number): void {
	applyAudioPipeline(video, volume);
}

/**
 * Disposes the Web Audio graph for a video element when tearing down.
 */
export function disposeAudioBoost(video: HTMLVideoElement): void {
	const nodes = boostMap.get(video);
	if (!nodes) return;

	boostMap.delete(video);
	try {
		for (const f of nodes.filters) {
			f.disconnect();
		}

		nodes.compressorNode.disconnect();
		nodes.gainNode.disconnect();
		nodes.sourceNode.disconnect();
		detach(() => nodes.ctx.close());
	} catch (error) {
		console.warn("Failed to dispose audio graph:", error);
	}
}
