import type { PlaybackCommand, PlaybackSessionSummary } from "@reelvault/sdk";
import { Pause, Play, RotateCcw, RotateCw, Square, Volume2, VolumeX } from "lucide-react";
import { useRef, useState } from "react";
import { useRealtimeEvent } from "@/client/hooks/use-realtime";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { m } from "@/paraglide/messages";
import { formatTimestamp } from "@/utils/format-utils";
import { UserSectionTitle } from "../../components/user-ui";

interface RemotePlaybackControlsSectionProps {
	session: PlaybackSessionSummary;
	onSendCommand: (command: PlaybackCommand) => void;
	isPending?: boolean;
}

export function RemotePlaybackControlsSection({ session, onSendCommand, isPending }: RemotePlaybackControlsSectionProps) {
	const [volume, setVolume] = useState(50);
	// Previous (pre-mute) volume is handler-only bookkeeping — a ref avoids an
	// unnecessary re-render of the whole controls section on every mute toggle.
	const previousVolumeRef = useRef(50);
	const [position, setPosition] = useState<number | null>(null);
	const [duration, setDuration] = useState<number | null>(null);
	const [isPaused, setIsPaused] = useState<boolean | null>(null);

	useRealtimeEvent<{ sessionId?: string; position?: number; duration?: number; isPaused?: boolean }>(
		"playback:session:progress",
		(data) => {
			if (data.sessionId !== session.sessionId) return;

			if (typeof data.position === "number") setPosition(data.position);

			if (typeof data.duration === "number") setDuration(data.duration);

			if (typeof data.isPaused === "boolean") setIsPaused(data.isPaused);
		},
	);

	const handlePlay = () => {
		setIsPaused(false);
		onSendCommand({ type: "play" });
	};

	const handlePause = () => {
		setIsPaused(true);
		onSendCommand({ type: "pause" });
	};

	const handleSeekRelative = (relative: number) => {
		if (typeof position === "number") {
			setPosition((prev) => Math.max(0, (prev ?? 0) + relative));
		}

		onSendCommand({ type: "seek", relative });
	};

	const handleToggleMute = () => {
		if (volume > 0) {
			previousVolumeRef.current = volume;
			setVolume(0);
			onSendCommand({ type: "setVolume", volume: 0 });
		} else {
			const restored = previousVolumeRef.current > 0 ? previousVolumeRef.current : 50;
			setVolume(restored);
			onSendCommand({ type: "setVolume", volume: restored / 100 });
		}
	};

	return (
		<section>
			<UserSectionTitle title={m.user_remote_control_eyebrow()} description={session.title ?? undefined} />
			<div className="border-border/70 bg-card/70 flex flex-col gap-6 rounded-2xl border p-6">
				{duration != null && duration > 0 ? (
					<div className="mx-auto flex w-full max-w-sm flex-col gap-2">
						<div className="text-muted-foreground flex items-center justify-between font-mono text-xs">
							<span>{formatTimestamp(position ?? 0)}</span>
							<span>{formatTimestamp(duration)}</span>
						</div>
						<Slider
							value={[position ?? 0]}
							min={0}
							max={duration}
							step={1}
							onValueCommitted={(value) => {
								const next = typeof value === "number" ? value : (value[0] ?? 0);
								setPosition(next);
								onSendCommand({ type: "seek", position: next });
							}}
							aria-label={m.user_playback_position_aria()}
						/>
					</div>
				) : null}

				<div className="flex flex-wrap items-center justify-center gap-3">
					<Button
						shape="pill"
						variant="outline"
						size="icon"
						aria-label={m.user_remote_rewind_10s()}
						title={m.user_remote_rewind_10s()}
						disabled={isPending}
						onClick={() => handleSeekRelative(-10)}
					>
						<RotateCcw className="size-5" />
					</Button>
					<Button
						shape="pill"
						variant={isPaused === false ? "default" : "outline"}
						size="icon"
						aria-label={m.user_remote_pause()}
						aria-pressed={!isPaused}
						disabled={isPending}
						onClick={handlePause}
					>
						<Pause className="size-6" />
					</Button>
					<Button
						shape="pill"
						variant={isPaused === true ? "default" : "outline"}
						size="icon"
						aria-label={m.user_remote_play()}
						aria-pressed={!isPaused}
						disabled={isPending}
						onClick={handlePlay}
					>
						<Play className="size-6" />
					</Button>
					<Button
						shape="pill"
						variant="outline"
						size="icon"
						aria-label={m.user_remote_forward_10s()}
						title={m.user_remote_forward_10s()}
						disabled={isPending}
						onClick={() => handleSeekRelative(10)}
					>
						<RotateCw className="size-5" />
					</Button>
					<Button
						variant="destructive-outline"
						size="icon"
						aria-label={m.user_stop_playback_aria()}
						disabled={isPending}
						onClick={() => onSendCommand({ type: "stop" })}
					>
						<Square className="size-5" />
					</Button>
				</div>

				<div className="mx-auto flex w-full max-w-sm items-center gap-3">
					<Button
						tone="muted"
						type="button"
						variant="ghost"
						size="icon"
						className="shrink-0"
						onClick={handleToggleMute}
						aria-label={volume === 0 ? m.user_remote_unmute() : m.user_remote_mute()}
						title={volume === 0 ? m.user_remote_unmute() : m.user_remote_mute()}
					>
						{volume === 0 ? (
							<VolumeX className="text-destructive size-5" aria-hidden="true" />
						) : (
							<Volume2 className="size-5" aria-hidden="true" />
						)}
					</Button>
					<Slider
						value={[volume]}
						min={0}
						max={100}
						step={5}
						onValueCommitted={(value) => {
							const next = typeof value === "number" ? volume : (value[0] ?? volume);
							setVolume(next);
							onSendCommand({ type: "setVolume", volume: next / 100 });
						}}
						aria-label={m.user_volume()}
					/>
					<span className="text-muted-foreground w-10 shrink-0 text-right font-mono text-xs">
						{m.common_percent_value({ value: volume })}
					</span>
				</div>

				<p className="text-muted-foreground text-center text-xs">{m.user_commands_to_device_note()}</p>
			</div>
		</section>
	);
}
