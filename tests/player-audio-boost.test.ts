import { describe, expect, test } from "bun:test";
import {
	applyAudioPipeline,
	disposeAudioBoost,
	EQUALIZER_BANDS,
	EQUALIZER_PRESETS,
	getStoredEqualizerConfig,
	isEqualizerActive,
	MAX_PLAYER_VOLUME,
	saveStoredEqualizerConfig,
} from "@/pages/player/utils/player-audio-boost";

// Deliberate no-op stub shared by the DOM mocks below; none of these
// callbacks influence the behavior this suite exercises.
const noop = (): void => {
	// Intentionally empty.
};

describe("player audio boost & equalizer", () => {
	test("MAX_PLAYER_VOLUME is 2 (200%)", () => {
		expect(MAX_PLAYER_VOLUME).toBe(2);
	});

	test("equalizer has 5 defined frequency bands", () => {
		expect(EQUALIZER_BANDS).toHaveLength(5);
		expect(EQUALIZER_BANDS.map((b) => b.frequency)).toEqual([60, 250, 1000, 4000, 12000]);
	});

	test("equalizer presets include flat, dialogue, night, bass, treble, cinema, custom", () => {
		const presetIds = EQUALIZER_PRESETS.map((p) => p.id);
		expect(presetIds).toContain("flat");
		expect(presetIds).toContain("dialogue");
		expect(presetIds).toContain("night");
		expect(presetIds).toContain("bass");
		expect(presetIds).toContain("treble");
		expect(presetIds).toContain("cinema");
		expect(presetIds).toContain("custom");
	});

	test("isEqualizerActive checks preset, compressor, and non-zero gains", () => {
		expect(
			isEqualizerActive({
				preset: "flat",
				gains: [0, 0, 0, 0, 0],
				compressorEnabled: false,
			}),
		).toBe(false);

		expect(
			isEqualizerActive({
				preset: "dialogue",
				gains: [-2, -1, 4, 3, 0],
				compressorEnabled: false,
			}),
		).toBe(true);

		expect(
			isEqualizerActive({
				preset: "flat",
				gains: [0, 0, 0, 0, 0],
				compressorEnabled: true,
			}),
		).toBe(true);

		expect(
			isEqualizerActive({
				preset: "flat",
				gains: [0, 0, 1, 0, 0],
				compressorEnabled: false,
			}),
		).toBe(true);
	});

	test("getStoredEqualizerConfig and saveStoredEqualizerConfig persist properly", () => {
		const originalWindow = globalThis.window;
		const storage = new Map<string, string>();
		globalThis.window = {
			localStorage: {
				getItem: (key: string) => storage.get(key) ?? null,
				setItem: (key: string, val: string) => storage.set(key, val),
				removeItem: (key: string) => storage.delete(key),
				clear: () => storage.clear(),
			},
		} as unknown as Window & typeof globalThis;

		try {
			const initial = getStoredEqualizerConfig();
			expect(initial.preset).toBe("flat");
			expect(initial.compressorEnabled).toBe(false);

			saveStoredEqualizerConfig({
				preset: "dialogue",
				gains: [-2, -1, 4, 3, 0],
				compressorEnabled: false,
			});

			const loaded = getStoredEqualizerConfig();
			expect(loaded.preset).toBe("dialogue");
			expect(loaded.gains).toEqual([-2, -1, 4, 3, 0]);
			expect(loaded.compressorEnabled).toBe(false);
		} finally {
			globalThis.window = originalWindow;
		}
	});

	test("does not initialize audio context when volume <= 1 and EQ is inactive", () => {
		let contextCreated = false;

		// Constructed with `new` by the audio pipeline, so a plain function
		// is enough — instances carry no state this test needs to inspect.
		function MockAudioContext(): void {
			contextCreated = true;
		}

		const originalWindow = globalThis.window;
		const originalAudioContext = globalThis.AudioContext;

		globalThis.window = {
			AudioContext: MockAudioContext as unknown as typeof AudioContext,
			addEventListener: noop,
			removeEventListener: noop,
			localStorage: { getItem: () => null, setItem: noop },
		} as unknown as Window & typeof globalThis;
		globalThis.AudioContext = MockAudioContext as unknown as typeof AudioContext;

		try {
			const fakeVideo = {
				addEventListener: noop,
				removeEventListener: noop,
			} as unknown as HTMLVideoElement;
			applyAudioPipeline(fakeVideo, 0.8, {
				preset: "flat",
				gains: [0, 0, 0, 0, 0],
				compressorEnabled: false,
			});
			expect(contextCreated).toBe(false);
		} finally {
			globalThis.window = originalWindow;
			globalThis.AudioContext = originalAudioContext;
		}
	});

	test("initializes audio pipeline, applies filter gains, routes compressor when requested, and cleans up", () => {
		const connectedFilters: unknown[] = [];
		const filterGains: number[] = [];
		let lastFilterDestination: unknown = null;
		let compressorDestination: unknown = null;
		let gainDestination: unknown = null;
		let volumeGainValue = 1;
		let contextClosed = false;

		class MockGainNode {
			gain = {
				value: 1,
				setValueAtTime: (val: number) => {
					volumeGainValue = val;
					this.gain.value = val;
				},
			};
			connect(dest: unknown) {
				gainDestination = dest;
			}
			disconnect() {
				// No graph resources to release in this mock.
			}
		}

		class MockBiquadFilterNode {
			type = "peaking";
			frequency = { value: 1000 };
			Q = { value: 1 };
			gain = {
				value: 0,
				setValueAtTime: (val: number) => {
					this.gain.value = val;
					filterGains.push(val);
				},
			};
			connect(dest: unknown) {
				connectedFilters.push(dest);
				lastFilterDestination = dest;
			}
			disconnect() {
				lastFilterDestination = null;
			}
		}

		class MockDynamicsCompressorNode {
			threshold = { value: 0 };
			knee = { value: 0 };
			ratio = { value: 0 };
			attack = { value: 0 };
			release = { value: 0 };
			connect(dest: unknown) {
				compressorDestination = dest;
			}
			disconnect() {
				compressorDestination = null;
			}
		}

		class MockSourceNode {
			connect() {
				// The source node wiring is internal to the context mock.
			}
			disconnect() {
				// No resources to release in this mock.
			}
		}

		class MockAudioContext {
			currentTime = 0;
			state = "running";
			destination = {
				maxChannelCount: 6,
				channelCount: 2,
				channelInterpretation: "speakers",
			};
			createMediaElementSource() {
				return new MockSourceNode();
			}
			createGain() {
				return new MockGainNode();
			}
			createBiquadFilter() {
				return new MockBiquadFilterNode();
			}
			createDynamicsCompressor() {
				return new MockDynamicsCompressorNode();
			}
			resume = () => Promise.resolve();
			close = () => {
				contextClosed = true;

				return Promise.resolve();
			};
		}

		const originalWindow = globalThis.window;
		const originalAudioContext = globalThis.AudioContext;

		globalThis.window = {
			AudioContext: MockAudioContext as unknown as typeof AudioContext,
			addEventListener: noop,
			removeEventListener: noop,
			localStorage: { getItem: () => null, setItem: noop },
		} as unknown as Window & typeof globalThis;
		globalThis.AudioContext = MockAudioContext as unknown as typeof AudioContext;

		try {
			const fakeVideo = {
				addEventListener: noop,
				removeEventListener: noop,
			} as unknown as HTMLVideoElement;

			// Apply dialogue preset with volume 1.5
			applyAudioPipeline(fakeVideo, 1.5, {
				preset: "dialogue",
				gains: [-2, -1, 4, 3, 0],
				compressorEnabled: false,
			});

			// Verify 5 filters were created and chained
			expect(connectedFilters.length).toBeGreaterThanOrEqual(5);
			expect(lastFilterDestination).toBeInstanceOf(MockGainNode);
			expect(compressorDestination).toBeNull();
			expect(gainDestination).toBeDefined();
			expect(volumeGainValue).toBe(1.5);

			// Enable compressor (e.g. night mode)
			applyAudioPipeline(fakeVideo, 1.5, {
				preset: "night",
				gains: [-3, -1, 2, 1, -2],
				compressorEnabled: true,
			});

			// Now last filter routes into compressor, compressor into gainNode
			expect(lastFilterDestination).toBeInstanceOf(MockDynamicsCompressorNode);
			expect(compressorDestination).toBeInstanceOf(MockGainNode);

			// Disable compressor again
			applyAudioPipeline(fakeVideo, 1.0, {
				preset: "flat",
				gains: [0, 0, 0, 0, 0],
				compressorEnabled: false,
			});
			expect(lastFilterDestination).toBeInstanceOf(MockGainNode);
			expect(compressorDestination).toBeNull();
			expect(volumeGainValue).toBe(1.0);

			// Dispose cleans up
			disposeAudioBoost(fakeVideo);
			expect(contextClosed).toBe(true);
		} finally {
			globalThis.window = originalWindow;
			globalThis.AudioContext = originalAudioContext;
		}
	});
});
