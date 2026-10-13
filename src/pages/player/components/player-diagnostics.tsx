import type { PlaybackDiagnostics } from "@reelvault/sdk";
import { cn } from "cn";
import { Activity, Cpu, Film, Layers, Monitor, X } from "lucide-react";
import { CopyIcon } from "@/components/copy-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { useCopyToClipboard } from "@/utils/clipboard-utils";
import { formatTimestamp } from "@/utils/format-utils";
import { toast } from "@/utils/toast-facade";
import { usePlayerDiagnosticsData, usePlayerDiagnosticsToggle } from "../player-context";
import { formatTranscodeReasons } from "../utils/player-transcode-reason";

type DiagnosticsData = ReturnType<typeof usePlayerDiagnosticsData>;
type PlayerSessionState = DiagnosticsData["session"];
type ClientMetrics = DiagnosticsData["clientMetrics"];

function formatBytes(bytes?: number | null): string {
	if (!bytes || bytes <= 0) return m.player_no_data();

	const units = ["B", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));

	return `${(bytes / 1024 ** i).toFixed(2)} ${units[i] ?? ""}`;
}

function audioLayoutLabel(layout: string | null, channels: number | null): string {
	if (layout) return ` · ${layout}`;

	if (channels) return ` · ${channels} ch`;

	return "";
}

function bufferStateLabel(state: string): string {
	if (state === "completed") return m.admin_finished_fully_buffered();

	if (state === "transcoding") return m.player_transcoding_in_progress();

	return m.common_waiting();
}

function formatDuration(seconds?: number | null): string {
	if (!seconds || seconds <= 0) return m.player_no_data();

	return formatTimestamp(seconds);
}

/** Media source: the file as the server read it. */
function SourceSection({ source }: { source: PlaybackDiagnostics["source"] }) {
	return (
		<div className="space-y-1.5 rounded-lg border border-border/50 bg-background/60 p-2.5">
			<div className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
				<Film className="size-3.5 text-primary" aria-hidden="true" />
				<span>{m.player_file_source_server()}</span>
			</div>
			<div className="grid gap-1 text-xs">
				<div className="flex justify-between gap-2">
					<span>{m.player_format_and_size()}</span>
					<span className="font-medium text-foreground">
						{m.player_source_summary({
							container: source.container?.toUpperCase() ?? m.player_no_data(),
							size: formatBytes(source.sizeBytes),
							duration: formatDuration(source.duration),
						})}
					</span>
				</div>
				<div className="flex justify-between gap-2">
					<span>{m.player_total_source_bitrate()}</span>
					<span className="font-medium text-foreground">
						{source.bitrateKbps ? `${source.bitrateKbps.toLocaleString()} kbps` : m.player_no_data()}
					</span>
				</div>
				<div className="flex justify-between gap-2">
					<span>{m.admin_source_video()}</span>
					<span className="font-medium text-foreground">
						{source.videoCodec ? source.videoCodec.toUpperCase() : m.player_none_word()}
						{source.videoProfile ? ` (${source.videoProfile})` : ""}
						{m.common_dot_separator()}
						{source.width && source.height ? `${source.width}×${source.height}` : m.player_no_data()}{" "}
						{source.frameRate ? `· ${source.frameRate} fps` : ""} {source.pixelFormat ? `· ${source.pixelFormat}` : ""}
					</span>
				</div>
				<div className="flex justify-between gap-2">
					<span>{m.admin_source_audio()}</span>
					<span className="truncate font-medium text-foreground">
						{source.audioStreamIndex !== null ? `#${source.audioStreamIndex} ` : ""}
						{source.audioCodec ? source.audioCodec.toUpperCase() : m.player_none_word()}
						{audioLayoutLabel(source.audioChannelLayout, source.audioChannels)}{" "}
						{source.audioLanguage ? `(${source.audioLanguage.toUpperCase()})` : ""}
						{source.audioTitle ? ` · ${source.audioTitle}` : ""}
					</span>
				</div>
			</div>
		</div>
	);
}

interface PipelineSectionProps {
	playback: PlaybackDiagnostics["session"];
	session: PlayerSessionState;
	isTranscode: boolean;
	videoTranscode: boolean;
	audioTranscode: boolean;
}

/** Server pipeline: the transcode decision, its reasons and the ffmpeg process behind it. */
function PipelineSection({ playback, session, isTranscode, videoTranscode, audioTranscode }: PipelineSectionProps) {
	return (
		<div className="space-y-1.5 rounded-lg border border-border/50 bg-background/60 p-2.5">
			<div className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
				<Cpu className="size-3.5 text-primary" aria-hidden="true" />
				<span>{m.player_stream_pipeline_heading()}</span>
			</div>
			<div className="grid gap-1 text-xs">
				<div className="flex justify-between gap-2">
					<span>{m.player_server_decision()}</span>
					<span className="text-right font-medium text-foreground">
						{isTranscode ? m.player_transcoding_on_the_fly() : m.player_direct_transfer_direct_stream()}
					</span>
				</div>
				{playback?.tonemapped && (
					<div className="flex justify-between gap-2">
						<span>{m.player_tonemapping_label()}</span>
						<span className="text-right font-medium text-foreground">
							{m.player_tonemapping_yes_method({ method: playback.toneMapMethod ?? "auto" })}
						</span>
					</div>
				)}
				<div className="flex justify-between gap-2">
					<span>{m.player_reason_label()}</span>
					<span className="text-right text-foreground">{formatTranscodeReasons(session.reasons)}</span>
				</div>
				<div className="flex justify-between gap-2">
					<span>{m.admin_stream_video()}</span>
					<span
						className={cn("font-medium", {
							"text-warning dark:text-warning": videoTranscode,
							"text-success dark:text-success": !videoTranscode,
						})}
					>
						{videoTranscode
							? m.player_video_transcode_named({
									encoder: playback?.videoEncoder ?? "libx264",
									limit: playback?.targetVideoBitrateKbps
										? m.player_video_transcode_bitrate_limit({ value: String(playback.targetVideoBitrateKbps) })
										: "",
								})
							: m.player_lossless_copy()}
					</span>
				</div>
				<div className="flex justify-between gap-2">
					<span>{m.admin_stream_audio()}</span>
					<span
						className={cn("font-medium", {
							"text-warning dark:text-warning": audioTranscode,
							"text-success dark:text-success": !audioTranscode,
						})}
					>
						{audioTranscode ? m.player_audio_transcode_stereo({ encoder: playback?.audioEncoder ?? "aac" }) : m.player_lossless_copy()}
					</span>
				</div>
				<div className="flex justify-between gap-2">
					<span>{m.admin_hwaccel_label()}</span>
					<span className="font-medium text-foreground">
						{playback?.hwaccel && playback.hwaccel !== "none"
							? m.player_gpu_label({ hwaccel: playback.hwaccel.toUpperCase() })
							: m.player_software_cpu()}
					</span>
				</div>
				{playback && (
					<div className="flex justify-between gap-2">
						<span>{m.player_ffmpeg_process_label()}</span>
						<span className="font-medium text-foreground">
							{m.player_ffmpeg_process_info({
								pid: playback.processId ?? "n/a",
								start: Math.round(playback.startTime),
							})}
							{playback.processExitCode !== null ? m.player_exit_code_short({ code: playback.processExitCode }) : ""}
						</span>
					</div>
				)}
			</div>
		</div>
	);
}

/** Buffering and bandwidth, from the server's buffer and from this client. */
function BufferSection({ buffer, clientMetrics }: { buffer: PlaybackDiagnostics["buffer"]; clientMetrics: ClientMetrics }) {
	return (
		<div className="space-y-1.5 rounded-lg border border-border/50 bg-background/60 p-2.5">
			<div className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
				<Layers className="size-3.5 text-primary" aria-hidden="true" />
				<span>{m.player_buffer_network()}</span>
			</div>
			<div className="grid gap-1 text-xs">
				{buffer ? (
					<>
						<div className="flex justify-between gap-2">
							<span>{m.player_server_buffer_state()}</span>
							<span className="font-medium text-foreground">{bufferStateLabel(buffer.state)}</span>
						</div>
						<div className="flex justify-between gap-2">
							<span>{m.admin_server_buffered_seconds_label()}</span>
							<span className="font-medium text-foreground">
								{m.player_buffered_seconds_segments({
									seconds: buffer.bufferedSeconds,
									segments: m.player_buffer_segments_count({
										count: buffer.segments,
										duration: buffer.segmentDuration,
									}),
									progress: buffer.progressPercent !== null ? ` · ${buffer.progressPercent}%` : "",
								})}
							</span>
						</div>
					</>
				) : null}
				<div className="flex justify-between gap-2">
					<span>{m.player_client_buffer_label()}</span>
					<span className="font-medium text-foreground">{m.player_buffered_seconds({ seconds: clientMetrics?.bufferedSeconds ?? 0 })}</span>
				</div>
				{clientMetrics?.bandwidthEstimate ? (
					<div className="flex justify-between gap-2">
						<span>{m.player_estimated_bandwidth()}</span>
						<span className="font-medium text-foreground">
							{m.player_bandwidth_mbps({ value: (clientMetrics.bandwidthEstimate / 1_000_000).toFixed(1) })}
						</span>
					</div>
				) : null}
			</div>
		</div>
	);
}

/** The HTML5 player on this device: rendered resolution, frame counts and the session id. */
function Html5Section({ session, clientMetrics }: { session: PlayerSessionState; clientMetrics: ClientMetrics }) {
	return (
		<div className="space-y-1.5 rounded-lg border border-border/50 bg-background/60 p-2.5">
			<div className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
				<Monitor className="size-3.5 text-primary" aria-hidden="true" />
				<span>{m.player_html5_player()}</span>
			</div>
			<div className="grid gap-1 text-xs">
				<div className="flex justify-between gap-2">
					<span>{m.player_rendered_resolution()}</span>
					<span className="font-medium text-foreground">
						{clientMetrics?.videoWidth && clientMetrics.videoHeight
							? `${clientMetrics.videoWidth}×${clientMetrics.videoHeight} px`
							: m.common_not_applicable_short()}
					</span>
				</div>
				<div className="flex justify-between gap-2">
					<span>{m.player_video_frames()}</span>
					<span className="font-medium text-foreground">
						{m.player_rendered_frames_stats({ rendered: clientMetrics?.totalFrames.toLocaleString() ?? "0" })}
						<span className={clientMetrics?.droppedFrames ? "text-destructive" : "text-success"}>{clientMetrics?.droppedFrames ?? 0}</span>
						{clientMetrics?.totalFrames ? ` (${((clientMetrics.droppedFrames / clientMetrics.totalFrames) * 100).toFixed(2)}%)` : ""}
					</span>
				</div>
				<div className="flex justify-between gap-2">
					<span>{m.player_session_id()}</span>
					<span className="truncate font-mono text-foreground text-xs" title={session.sessionId}>
						{session.sessionId}
					</span>
				</div>
			</div>
		</div>
	);
}

export function PlayerDiagnostics() {
	const { isOpen, close } = usePlayerDiagnosticsToggle();
	const { diagnostics, isPending, isError, session, clientMetrics } = usePlayerDiagnosticsData();
	const { hasCopied, markCopied } = useCopyToClipboard();

	if (!isOpen) return null;

	const isTranscode = session.mode === "transcode";
	const videoTranscode = diagnostics?.session?.videoTranscode ?? isTranscode;
	const audioTranscode = diagnostics?.session?.audioTranscode ?? false;

	const handleCopyJson = async () => {
		try {
			const payload = {
				session,
				diagnostics,
				clientMetrics,
				timestamp: new Date().toISOString(),
			};
			await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
			markCopied();
			toast.success(m.player_telemetry_copied());
		} catch {
			toast.error(m.admin_failed_to_copy_data());
		}
	};

	return (
		<aside
			aria-label={m.player_diagnostics_label()}
			className="absolute top-14 left-3 z-40 max-h-[85vh] w-[min(36rem,calc(100vw-1.5rem))] overflow-y-auto rounded-xl border border-border/80 bg-popover/95 p-3.5 font-mono text-popover-foreground text-xs shadow-2xl md:top-16 md:left-8 md:p-4"
		>
			{/* Header */}
			<div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-border/40 border-b pb-2.5 font-sans">
				<div className="flex flex-wrap items-center gap-2">
					<div className="flex items-center gap-1.5">
						<Activity className="size-4 text-primary" aria-hidden="true" />
						<p className="font-bold text-foreground text-sm">{m.player_diagnostics_heading()}</p>
					</div>
					<Badge variant={isTranscode ? "secondary" : "success"} size="sm" font="mono" transform="uppercase">
						{isTranscode ? m.admin_workers_category_streaming() : m.common_direct_stream()}
					</Badge>
				</div>
				<div className="flex items-center gap-1">
					<Button type="button" variant="ghost" size="sm" onClick={() => detach(handleCopyJson)} title={m.player_copy_raw_json_hint()}>
						<CopyIcon copied={hasCopied} />
						<span className="hidden sm:inline">{m.player_copy_json_short()}</span>
					</Button>
					<Button type="button" variant="ghost" size="icon-sm" onClick={close} title={m.player_close_diagnostics()}>
						<X className="size-4" aria-hidden="true" />
						<span className="sr-only">{m.common_close()}</span>
					</Button>
				</div>
			</div>

			{isPending && <p className="text-muted-foreground">{m.player_fetching_telemetry()}</p>}
			{isError && <p className="text-destructive">{m.player_diagnostics_fetch_failed()}</p>}

			{diagnostics && (
				<div className="grid gap-2.5 text-muted-foreground">
					<SourceSection source={diagnostics.source} />
					<PipelineSection
						playback={diagnostics.session}
						session={session}
						isTranscode={isTranscode}
						videoTranscode={videoTranscode}
						audioTranscode={audioTranscode}
					/>
					<BufferSection buffer={diagnostics.buffer} clientMetrics={clientMetrics} />
					<Html5Section session={session} clientMetrics={clientMetrics} />
				</div>
			)}
		</aside>
	);
}
