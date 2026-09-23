import { cn } from "cn";
import { FastForward, Gauge, Maximize, Minimize, Pause, Play, Rewind, Subtitles, Volume1, Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";
import { m } from "@/paraglide/messages";
import { MAX_PLAYER_VOLUME } from "../utils/player-audio-boost";

export interface FeedbackEvent {
	id: number;
	type: "play" | "pause" | "volume" | "seek" | "speed" | "subtitles" | "fullscreen";
	value?: number | string | boolean;
	label?: string;
	delta?: number;
}

let feedbackListeners: Array<(event: FeedbackEvent) => void> = [];
let feedbackIdCounter = 0;

export function showPlayerFeedback(event: Omit<FeedbackEvent, "id">) {
	const fullEvent: FeedbackEvent = {
		...event,
		id: ++feedbackIdCounter,
	};
	for (const listener of feedbackListeners) {
		listener(fullEvent);
	}
}

export function PlayerFeedbackHud() {
	const [activeEvent, setActiveEvent] = useState<FeedbackEvent | null>(null);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		let hideTimer: ReturnType<typeof setTimeout> | null = null;

		const handler = (event: FeedbackEvent) => {
			if (hideTimer) clearTimeout(hideTimer);

			setActiveEvent(event);
			setIsVisible(true);

			hideTimer = setTimeout(() => {
				setIsVisible(false);
			}, 850);
		};

		feedbackListeners.push(handler);

		return () => {
			feedbackListeners = feedbackListeners.filter((l) => l !== handler);
			if (hideTimer) clearTimeout(hideTimer);
		};
	}, []);

	if (!(activeEvent && isVisible)) return null;

	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: one render branch per feedback event type, mapping 1:1 to the event union
	const renderContent = () => {
		switch (activeEvent.type) {
			case "play":
				return (
					<div className="flex size-20 items-center justify-center rounded-full bg-black/60 p-4 text-white shadow-2xl">
						<Play className="ml-1 size-10 fill-current" />
					</div>
				);
			case "pause":
				return (
					<div className="flex size-20 items-center justify-center rounded-full bg-black/60 p-4 text-white shadow-2xl">
						<Pause className="size-10 fill-current" />
					</div>
				);
			case "volume": {
				const vol = typeof activeEvent.value === "number" ? activeEvent.value : 0;
				const isMuted = activeEvent.value === 0 || activeEvent.label === "muted";
				const percent = Math.round((isMuted ? 0 : vol) * 100);
				const isBoosted = !isMuted && percent > 100;
				let VolIcon = Volume2;
				if (isMuted) VolIcon = VolumeX;
				else if (vol < 0.5) VolIcon = Volume1;

				let volumeText: string;
				if (isMuted) volumeText = m.player_muted_word();
				else if (isBoosted) volumeText = m.player_volume_boost({ percent });
				else volumeText = m.player_volume_percent({ percent });

				return (
					<div className="flex min-w-48 flex-col items-center gap-2 rounded-2xl bg-black/75 px-5 py-3.5 text-white shadow-2xl ring-1 ring-white/10">
						<div className="flex items-center gap-2.5">
							<VolIcon className={cn("size-5", isBoosted ? "text-warning" : "text-primary")} />
							<span className="font-semibold text-sm">{volumeText}</span>
						</div>
						<div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/20">
							<div className="pointer-events-none absolute top-0 bottom-0 left-1/2 z-10 w-0.5 -translate-x-1/2 bg-white/40" />
							<div
								className={cn("h-full transition-[width] duration-75", isBoosted ? "bg-warning" : "bg-primary")}
								style={{ width: `${Math.min(100, (percent / (MAX_PLAYER_VOLUME * 100)) * 100)}%` }}
							/>
						</div>
					</div>
				);
			}
			case "seek": {
				const delta = activeEvent.delta ?? 0;
				const isForward = delta >= 0;
				const Icon = isForward ? FastForward : Rewind;
				const text = isForward ? `+${delta}s` : `${delta}s`;

				return (
					<div className="flex items-center gap-2.5 rounded-2xl bg-black/75 px-5 py-3 text-white shadow-2xl ring-1 ring-white/10">
						<Icon className="size-5 text-primary" />
						<span className="font-bold font-mono text-base">{text}</span>
					</div>
				);
			}
			case "speed":
				return (
					<div className="flex items-center gap-2.5 rounded-2xl bg-black/75 px-5 py-3 text-white shadow-2xl ring-1 ring-white/10">
						<Gauge className="size-5 text-primary" />
						<span className="font-semibold text-sm">{m.player_speed_activeevent_value({ speed: String(activeEvent.value) })}</span>
					</div>
				);
			case "subtitles":
				return (
					<div className="flex max-w-sm items-center gap-2.5 rounded-2xl bg-black/75 px-5 py-3 text-white shadow-2xl ring-1 ring-white/10">
						<Subtitles className="size-5 shrink-0 text-primary" />
						<span className="truncate font-semibold text-sm">{activeEvent.label ?? m.player_subtitles_word()}</span>
					</div>
				);
			case "fullscreen":
				return (
					<div className="flex items-center gap-2.5 rounded-2xl bg-black/75 px-5 py-3 text-white shadow-2xl ring-1 ring-white/10">
						{activeEvent.value ? <Maximize className="size-5 text-primary" /> : <Minimize className="size-5 text-primary" />}
						<span className="font-semibold text-sm">
							{activeEvent.value ? m.player_fullscreen_entered() : m.player_fullscreen_exited()}
						</span>
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<div
			role="status"
			aria-live="polite"
			className={cn(
				"pointer-events-none absolute inset-0 z-35 flex items-center justify-center transition-opacity duration-200",
				// isVisible is guaranteed true here — the guard above returns early.
				"scale-100 opacity-100",
			)}
		>
			{renderContent()}
		</div>
	);
}
