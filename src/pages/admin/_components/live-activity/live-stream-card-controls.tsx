import type { AdminLiveStreamItem } from "@reelvault/sdk";
import { Download, Info, Pause, Play, Square } from "lucide-react";
import { ConfirmAction } from "@/components/confirm-action";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

interface LiveStreamCardControlsProps {
	stream: AdminLiveStreamItem;
	onTerminate: (sessionId: string, viewer: string) => Promise<void>;
	onOpenDetails: () => void;
	onDownloadLog: (sessionId: string) => void;
	onSendCommand: (type: "play" | "pause" | "stop") => void;
	isPending: boolean;
	isTerminating: boolean;
}

export function LiveStreamCardControls({
	stream,
	onTerminate,
	onOpenDetails,
	onDownloadLog,
	onSendCommand,
	isPending,
	isTerminating,
}: LiveStreamCardControlsProps) {
	return (
		<div className="flex items-center gap-1.5">
			<Button
				type="button"
				variant="outline"
				size="sm"
				onClick={() => onSendCommand("pause")}
				disabled={isPending}
				className="h-7 cursor-pointer gap-1 px-2 font-medium text-[11px]"
				title={m.admin_live_remote_pause_hint()}
			>
				<Pause className="size-3 fill-current text-warning" />
				<span className="hidden sm:inline">{m.admin_logs_paused()}</span>
			</Button>

			<Button
				type="button"
				variant="outline"
				size="sm"
				onClick={() => onSendCommand("play")}
				disabled={isPending}
				className="h-7 cursor-pointer gap-1 px-2 font-medium text-[11px]"
				title={m.admin_resume_remote_playback()}
			>
				<Play className="size-3 fill-current text-primary" />
				<span className="hidden sm:inline">{m.admin_resume()}</span>
			</Button>

			<Button
				type="button"
				variant="outline"
				size="sm"
				onClick={onOpenDetails}
				className="h-7 cursor-pointer gap-1 px-2 font-medium text-[11px]"
				title={m.admin_open_stream_diagnostics()}
			>
				<Info className="size-3 text-primary" />
				<span>{m.common_details()}</span>
			</Button>

			<Button
				type="button"
				variant="outline"
				size="sm"
				onClick={() => onDownloadLog(stream.sessionId)}
				className="h-7 cursor-pointer gap-1 px-2 font-medium text-[11px]"
				title={m.admin_live_download_log_hint()}
			>
				<Download className="size-3 text-primary" />
				<span className="hidden sm:inline">{m.admin_live_download_log()}</span>
			</Button>

			<ConfirmAction
				title={m.admin_live_stop_title()}
				description={m.admin_live_stop_confirm({ title: stream.title, viewer: stream.profileName })}
				confirmLabel={m.admin_workers_stop_word()}
				onConfirm={() => onTerminate(stream.sessionId, stream.profileName)}
				trigger={
					<Button
						type="button"
						variant="destructive"
						size="sm"
						disabled={isTerminating}
						className="h-7 cursor-pointer gap-1 px-2.5 font-semibold text-[11px]"
						title={m.admin_live_stop_session_hint()}
					>
						<Square className="size-3 fill-current" />
						<span className="hidden sm:inline">{m.admin_workers_stop_word()}</span>
					</Button>
				}
			/>
		</div>
	);
}
