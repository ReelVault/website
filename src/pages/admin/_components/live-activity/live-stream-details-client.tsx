import { Layers, Monitor } from "lucide-react";
import type { AdminLiveStreamItem } from "reelvault-sdk";
import { m } from "@/paraglide/messages";
import { formatTimeAgo, formatTimestamp } from "@/utils/format-utils";
import { browserLabel, clientLabel, osLabel } from "./live-activity-utils";

interface LiveStreamDetailsClientProps {
	stream: AdminLiveStreamItem;
}

export function LiveStreamDetailsClient({ stream }: LiveStreamDetailsClientProps) {
	let bufferStateLabel = m.admin_live_buffer_pending();
	if (stream.bufferState === "completed") {
		bufferStateLabel = m.admin_finished_fully_buffered();
	} else if (stream.bufferState === "transcoding") {
		bufferStateLabel = m.player_transcoding_in_progress();
	}

	return (
		<>
			{/* Client and connection */}
			<div className="flex flex-col gap-1.5 rounded-lg border border-border/50 bg-background/60 p-3">
				<div className="flex items-center gap-1.5 font-sans font-semibold text-foreground text-xs">
					<Monitor className="size-3.5 text-primary" />
					<span>{m.admin_client_and_device()}</span>
				</div>
				<div className="grid gap-1 text-[11px]">
					<div className="flex justify-between gap-2">
						<span>{m.admin_user_profile()}</span>
						<span className="font-medium text-foreground">
							{m.admin_live_client_identity({
								profileName: stream.profileName,
								userName: stream.userName,
								userEmail: stream.userEmail,
							})}
						</span>
					</div>
					<div className="flex justify-between gap-2">
						<span>{m.admin_device_browser_label()}</span>
						<span className="font-medium text-foreground">
							{m.admin_live_client_software({
								client: clientLabel(stream.clientName),
								browser: browserLabel(stream.browser),
								os: osLabel(stream.os),
							})}
						</span>
					</div>
					<div className="flex justify-between gap-2">
						<span>{m.admin_live_ip_address_label()}</span>
						<span className="font-medium text-foreground">{stream.ipAddress ?? m.admin_audit_local_no_ip()}</span>
					</div>
					{stream.encodePositionSeconds !== null && (
						<div className="flex justify-between gap-2">
							<span>{m.player_transcoding_in_progress()}</span>
							<span className="font-medium font-mono text-foreground">
								{m.admin_live_encode_position({
									position: formatTimestamp(stream.encodePositionSeconds),
									duration: formatTimestamp(stream.duration),
								})}
							</span>
						</div>
					)}
					<div className="flex justify-between gap-2">
						<span>{m.admin_session_started()}</span>
						<span className="font-medium text-foreground">{new Date(stream.startedAt).toLocaleString()}</span>
					</div>
					<div className="flex justify-between gap-2">
						<span>{m.admin_last_activity_heartbeat()}</span>
						<span className="font-medium text-foreground">{formatTimeAgo(stream.lastActivityAt)}</span>
					</div>
				</div>
			</div>

			{/* Server-side buffer */}
			{stream.bufferedSeconds !== null && (
				<div className="flex flex-col gap-1.5 rounded-lg border border-border/50 bg-background/60 p-3">
					<div className="flex items-center gap-1.5 font-sans font-semibold text-foreground text-xs">
						<Layers className="size-3.5 text-primary" />
						<span>{m.admin_server_buffer_heading()}</span>
					</div>
					<div className="grid gap-1 text-[11px]">
						<div className="flex justify-between gap-2">
							<span>{m.admin_live_buffer_state()}</span>
							<span className="font-medium text-foreground">{bufferStateLabel}</span>
						</div>
						<div className="flex justify-between gap-2">
							<span>{m.admin_server_buffered_seconds_label()}</span>
							<span className="font-medium text-foreground">{formatTimestamp(stream.bufferedSeconds)}</span>
						</div>
						{stream.bufferedUntil !== null && (
							<div className="flex justify-between gap-2">
								<span>{m.admin_live_buffer_until_label()}</span>
								<span className="font-medium text-foreground">{formatTimestamp(stream.bufferedUntil)}</span>
							</div>
						)}
					</div>
				</div>
			)}
		</>
	);
}
