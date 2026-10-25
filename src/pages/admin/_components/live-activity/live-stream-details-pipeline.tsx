import type { AdminLiveStreamItem } from "@reelvault/sdk";
import { cn } from "cn";
import { Cpu } from "lucide-react";
import { formatTranscodeReasons } from "@/pages/player/utils/player-transcode-reason";
import { m } from "@/paraglide/messages";

interface LiveStreamDetailsPipelineProps {
	stream: AdminLiveStreamItem;
	isDirect: boolean;
	formattedCurrent: string;
}

export function LiveStreamDetailsPipeline({ stream, isDirect, formattedCurrent }: LiveStreamDetailsPipelineProps) {
	return (
		<div className="border-border/50 bg-background/60 flex flex-col gap-1.5 rounded-lg border p-3">
			<div className="text-foreground flex items-center gap-1.5 font-sans text-xs font-semibold">
				<Cpu className="text-primary size-3.5" />
				<span>{m.player_stream_pipeline_heading()}</span>
			</div>
			<div className="grid gap-1 text-xs">
				<div className="flex justify-between gap-2">
					<span>{m.admin_live_server_decision()}</span>
					<span className="text-foreground font-medium">{isDirect ? m.admin_direct_stream() : m.player_transcoding_on_the_fly()}</span>
				</div>
				{stream.transcodeReasons && (
					<div className="flex justify-between gap-2">
						<span>{m.admin_decision_reason()}</span>
						<span className="text-foreground text-right">{formatTranscodeReasons(stream.transcodeReasons)}</span>
					</div>
				)}
				<div className="flex justify-between gap-2">
					<span>{m.admin_stream_video()}</span>
					<span
						className={cn("font-medium", {
							"text-warning dark:text-warning": stream.videoTranscode,
							"text-success dark:text-success": !stream.videoTranscode,
						})}
					>
						{stream.videoTranscode
							? m.admin_live_video_transcode_named({
									encoder: stream.videoEncoder,
									limit: stream.targetVideoBitrateKbps ? ` (limit ${stream.targetVideoBitrateKbps} kbps)` : "",
								})
							: m.player_lossless_copy()}
					</span>
				</div>
				<div className="flex justify-between gap-2">
					<span>{m.admin_stream_audio()}</span>
					<span
						className={cn("font-medium", {
							"text-warning dark:text-warning": stream.audioTranscode,
							"text-success dark:text-success": !stream.audioTranscode,
						})}
					>
						{stream.audioTranscode ? m.admin_live_audio_transcode_stereo({ encoder: stream.audioEncoder }) : m.player_lossless_copy()}
					</span>
				</div>
				<div className="flex justify-between gap-2">
					<span>{m.admin_hwaccel_label()}</span>
					<span className="text-foreground font-medium">
						{stream.hwaccel && stream.hwaccel !== "none"
							? m.admin_live_gpu_label({ hwaccel: stream.hwaccel.toUpperCase() })
							: "Software (CPU)"}
					</span>
				</div>
				<div className="flex justify-between gap-2">
					<span>{m.common_ffmpeg_process_label()}</span>
					<span className="text-foreground font-medium">
						{m.admin_live_pid_position({
							pid: stream.processId ?? m.admin_live_no_active_pid(),
							position: formattedCurrent,
						})}
					</span>
				</div>
			</div>
		</div>
	);
}
