import { lazy, Suspense, useState } from "react";
import type { AdminLiveStreamItem } from "@reelvault/sdk";
import { usePlaybackCommand } from "@/client/hooks/use-playback-session";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "@/utils/toast-utils";
import { formatStreamTime } from "./live-activity-utils";
import { LiveStreamCardControls } from "./live-stream-card-controls";
import { LiveStreamCardMedia } from "./live-stream-card-media";

const LiveStreamDetailsDialog = lazy(async () => ({
	default: (await import("./live-stream-details-dialog")).LiveStreamDetailsDialog,
}));

interface LiveStreamCardProps {
	stream: AdminLiveStreamItem;
	onTerminate: (sessionId: string, title: string, viewer: string) => void;
	isTerminating: boolean;
}

export function LiveStreamCard({ stream, onTerminate, isTerminating }: LiveStreamCardProps) {
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);
	const commandMutation = usePlaybackCommand(stream.sessionId);

	const handleSendCommand = async (type: "play" | "pause" | "stop") => {
		if (commandMutation.isPending) return;

		let commandToast: string;
		if (type === "pause") {
			commandToast = m.admin_live_paused_for({ profile: stream.profileName });
		} else if (type === "play") {
			commandToast = m.admin_live_resumed_for({ profile: stream.profileName });
		} else {
			commandToast = m.admin_live_stopped_for({ profile: stream.profileName });
		}

		try {
			await commandMutation.mutateAsync({ type });
			toast.success(commandToast);
		} catch (error) {
			toastError(m.admin_failed_to_send_command(), error);
		}
	};

	const formattedCurrent = formatStreamTime(stream.currentTime);
	const formattedDuration = formatStreamTime(stream.duration);

	return (
		<>
			<div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card shadow-lg transition-[border-color,background-color,color,box-shadow] hover:border-primary/50">
				<LiveStreamCardMedia stream={stream} />

				{/* Progress Bar & Telemetry */}
				<div className="flex flex-col gap-2.5 p-4 pt-3">
					{/* Progress Line */}
					<div className="flex flex-col gap-1">
						<div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
							<div
								className="h-full rounded-full bg-primary shadow-primary shadow-xs transition-[width] duration-300"
								style={{ width: `${stream.progressPercent}%` }}
							/>
						</div>

						<div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
							<span className="font-bold text-foreground">
								{m.admin_live_playback_position({ current: formattedCurrent, duration: formattedDuration })}
							</span>
							<span>{m.common_percent_value({ value: stream.progressPercent })}</span>
						</div>
					</div>

					{/* Quick Pipeline Badges */}
					<div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
						<Badge variant="outline" className="h-5 px-1.5 text-[10px]">
							{stream.videoTranscode ? (
								<span className="text-warning dark:text-warning">{m.admin_live_video_encoder({ encoder: stream.videoEncoder })}</span>
							) : (
								<span className="text-success dark:text-success">{m.admin_live_video_passthrough()}</span>
							)}
						</Badge>

						<Badge variant="outline" className="h-5 px-1.5 text-[10px]">
							{stream.audioTranscode ? (
								<span className="text-warning dark:text-warning">{m.admin_live_audio_encoder({ encoder: stream.audioEncoder })}</span>
							) : (
								<span className="text-success dark:text-success">{m.admin_live_audio_passthrough()}</span>
							)}
						</Badge>

						{stream.hwaccel && stream.hwaccel !== "none" && (
							<Badge variant="outline" className="h-5 border-primary/40 px-1.5 text-[10px] text-primary">
								{stream.hwaccel.toUpperCase()}
							</Badge>
						)}

						{stream.width && stream.height && (
							<span className="ml-auto text-[10px] text-muted-foreground">
								{m.components_media_file_resolution({ width: stream.width, height: stream.height })}
								{stream.bitrateKbps ? ` · ${Math.round(stream.bitrateKbps / 1000)} Mbps` : ""}
							</span>
						)}
					</div>

					{/* ffmpeg encode position — how far the server has processed the file (differs from the viewer's playback line above) */}
					{stream.encodePercent != null && stream.encodePercent < 100 && (
						<div className="flex flex-col gap-1">
							<div className="h-1 w-full overflow-hidden rounded-full bg-muted">
								<div
									className="h-full rounded-full bg-chart-2 transition-[width] duration-500"
									style={{ width: `${stream.encodePercent}%` }}
								/>
							</div>
							<span className="font-mono text-[10px] text-muted-foreground">
								{m.admin_live_encode_progress({ percent: stream.encodePercent, speed: stream.encodeSpeed ?? "—" })}
							</span>
						</div>
					)}

					{/* User Footer & Actions */}
					<div className="flex items-center justify-between border-border/50 border-t pt-2.5">
						<div className="flex min-w-0 items-center gap-2">
							<Avatar className="size-6 border border-border/60">
								{stream.profileAvatar && <AvatarImage src={stream.profileAvatar} alt={stream.profileName} />}
								<AvatarFallback className="font-bold text-[9px] uppercase">{stream.profileName.slice(0, 2)}</AvatarFallback>
							</Avatar>
							<div className="min-w-0">
								<p className="truncate font-bold text-foreground text-xs">{stream.profileName}</p>
								<p className="truncate text-[9px] text-muted-foreground">{m.admin_live_viewer_name({ name: stream.userName })}</p>
							</div>
						</div>

						<LiveStreamCardControls
							stream={stream}
							onTerminate={onTerminate}
							onOpenDetails={() => setIsDetailsOpen(true)}
							onSendCommand={(type) => {
								detach(handleSendCommand(type));
							}}
							isPending={commandMutation.isPending}
							isTerminating={isTerminating}
						/>
					</div>
				</div>
			</div>

			{/* Stream Details Dialog Modal */}
			{isDetailsOpen && (
				<Suspense fallback={null}>
					<LiveStreamDetailsDialog
						stream={stream}
						isOpen={isDetailsOpen}
						onClose={() => setIsDetailsOpen(false)}
						onTerminate={() => {
							setIsDetailsOpen(false);
							onTerminate(stream.sessionId, stream.title, stream.profileName);
						}}
						onSendCommand={handleSendCommand}
						isSendingCommand={commandMutation.isPending}
						isTerminating={isTerminating}
						formattedCurrent={formattedCurrent}
						formattedDuration={formattedDuration}
					/>
				</Suspense>
			)}
		</>
	);
}
