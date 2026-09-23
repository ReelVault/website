import { cn } from "cn";
import { Activity } from "lucide-react";
import type { AdminLiveStreamItem } from "@reelvault/sdk";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { m } from "@/paraglide/messages";
import { LiveStreamDetailsClient } from "./live-stream-details-client";
import { LiveStreamDetailsFooter } from "./live-stream-details-footer";
import { LiveStreamDetailsPipeline } from "./live-stream-details-pipeline";
import { LiveStreamDetailsSource } from "./live-stream-details-source";

interface LiveStreamDetailsDialogProps {
	stream: AdminLiveStreamItem;
	isOpen: boolean;
	onClose: () => void;
	onTerminate: () => void;
	onSendCommand: (type: "play" | "pause" | "stop") => Promise<void>;
	isSendingCommand: boolean;
	isTerminating: boolean;
	formattedCurrent: string;
	formattedDuration: string;
}

export function LiveStreamDetailsDialog({
	stream,
	isOpen,
	onClose,
	onTerminate,
	onSendCommand,
	isSendingCommand,
	isTerminating,
	formattedCurrent,
	formattedDuration,
}: LiveStreamDetailsDialogProps) {
	const isDirect = stream.mode === "direct-stream";

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-h-[90vh] w-full overflow-y-auto font-mono text-xs sm:max-w-2xl">
				<DialogHeader className="font-sans">
					<div className="flex flex-wrap items-center justify-between gap-2 pr-6">
						<div className="flex items-center gap-2">
							<Activity className="size-4.5 text-primary" />
							<DialogTitle className="font-bold text-base text-foreground">
								{m.admin_session_details({ streamTitle: stream.title })}
							</DialogTitle>
						</div>
						<Badge
							variant={isDirect ? "default" : "secondary"}
							className={cn("font-mono text-[10px] uppercase", {
								"bg-success/90 text-white": isDirect,
							})}
						>
							{isDirect ? m.common_direct_stream() : m.common_transcoding()}
						</Badge>
					</div>
					<DialogDescription className="font-mono text-[11px] text-muted-foreground">
						{m.admin_live_stream_session_viewer({
							sessionId: stream.sessionId,
							profileName: stream.profileName,
							userName: stream.userName,
						})}
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-3 pt-2 text-muted-foreground">
					<LiveStreamDetailsSource stream={stream} formattedDuration={formattedDuration} />
					<LiveStreamDetailsPipeline stream={stream} isDirect={isDirect} formattedCurrent={formattedCurrent} />
					<LiveStreamDetailsClient stream={stream} />
				</div>

				<LiveStreamDetailsFooter
					stream={stream}
					onTerminate={onTerminate}
					onSendCommand={onSendCommand}
					isSendingCommand={isSendingCommand}
					isTerminating={isTerminating}
				/>
			</DialogContent>
		</Dialog>
	);
}
