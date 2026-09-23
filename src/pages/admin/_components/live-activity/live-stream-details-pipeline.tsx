import { cn } from "cn";
import { Cpu } from "lucide-react";
import type { AdminLiveStreamItem } from "@reelvault/sdk";
import { formatTranscodeReasons } from "@/pages/player/utils/player-transcode-reason";
import { m } from "@/paraglide/messages";

interface LiveStreamDetailsPipelineProps {
	stream: AdminLiveStreamItem;
	isDirect: boolean;
	formattedCurrent: string;
}

export function LiveStreamDetailsPipeline({ stream, isDirect, formattedCurrent }: LiveStreamDetailsPipelineProps) {
	return (
		<div className="flex flex-col gap-1.5 rounded-lg border border-border/50 bg-background/60 p-3">
			<div className="flex items-center gap-1.5 font-sans font-semibold text-foreground text-xs">
				<Cpu className="size-3.5 text-primary" />
				<span>{m.player_stream_pipeline_heading()}</span>
			</div>
			<div className="grid gap-1 text-[11px]">
				<div className="flex justify-between gap-2">
					<span>{m.admin_live_server_decision()}</span>
					<span className="font-medium text-foreground">{isDirect ? m.admin_direct_stream() : m.player_transcoding_on_the_fly()}</span>
				</div>
				{stream.transcodeReasons && (
					<div className="flex justify-between gap-2">
						<span>{m.admin_decision_reason()}</span>
						<span className="text-right text-foreground">{formatTranscodeReasons(stream.transcodeReasons)}</span>
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
					<span className="font-medium text-foreground">
						{stream.hwaccel && stream.hwaccel !== "none"
							? m.admin_live_gpu_label({ hwaccel: stream.hwaccel.toUpperCase() })
							: "Software (CPU)"}
					</span>
				</div>
				<div className="flex justify-between gap-2">
					<span>{m.common_ffmpeg_process_label()}</span>
					<span className="font-medium text-foreground">
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
