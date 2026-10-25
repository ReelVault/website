import type { AdminLiveStreamItem } from "@reelvault/sdk";
import { Layers, Monitor } from "lucide-react";
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
			<div className="border-border/50 bg-background/60 flex flex-col gap-1.5 rounded-lg border p-3">
				<div className="text-foreground flex items-center gap-1.5 font-sans text-xs font-semibold">
					<Monitor className="text-primary size-3.5" />
					<span>{m.admin_client_and_device()}</span>
				</div>
				<div className="grid gap-1 text-xs">
					<div className="flex justify-between gap-2">
						<span>{m.admin_user_profile()}</span>
						<span className="text-foreground font-medium">
							{m.admin_live_client_identity({
								profileName: stream.profileName,
								userName: stream.userName,
								userEmail: stream.userEmail,
							})}
						</span>
					</div>
					<div className="flex justify-between gap-2">
						<span>{m.admin_device_browser_label()}</span>
						<span className="text-foreground font-medium">
							{m.admin_live_client_software({
								client: clientLabel(stream.clientName),
								browser: browserLabel(stream.browser),
								os: osLabel(stream.os),
							})}
						</span>
					</div>
					<div className="flex justify-between gap-2">
						<span>{m.admin_live_ip_address_label()}</span>
						<span className="text-foreground font-medium">{stream.ipAddress ?? m.admin_audit_local_no_ip()}</span>
					</div>
					{stream.encodePositionSeconds !== null && (
						<div className="flex justify-between gap-2">
							<span>{m.player_transcoding_in_progress()}</span>
							<span className="text-foreground font-mono font-medium">
								{m.admin_live_encode_position({
									position: formatTimestamp(stream.encodePositionSeconds),
									duration: formatTimestamp(stream.duration),
								})}
							</span>
						</div>
					)}
					<div className="flex justify-between gap-2">
						<span>{m.admin_session_started()}</span>
						<span className="text-foreground font-medium">{new Date(stream.startedAt).toLocaleString()}</span>
					</div>
					<div className="flex justify-between gap-2">
						<span>{m.admin_last_activity_heartbeat()}</span>
						<span className="text-foreground font-medium">{formatTimeAgo(stream.lastActivityAt)}</span>
					</div>
				</div>
			</div>

			{/* Server-side buffer */}
			{stream.bufferedSeconds !== null && (
				<div className="border-border/50 bg-background/60 flex flex-col gap-1.5 rounded-lg border p-3">
					<div className="text-foreground flex items-center gap-1.5 font-sans text-xs font-semibold">
						<Layers className="text-primary size-3.5" />
						<span>{m.admin_server_buffer_heading()}</span>
					</div>
					<div className="grid gap-1 text-xs">
						<div className="flex justify-between gap-2">
							<span>{m.admin_live_buffer_state()}</span>
							<span className="text-foreground font-medium">{bufferStateLabel}</span>
						</div>
						<div className="flex justify-between gap-2">
							<span>{m.admin_server_buffered_seconds_label()}</span>
							<span className="text-foreground font-medium">{formatTimestamp(stream.bufferedSeconds)}</span>
						</div>
						{stream.bufferedUntil !== null && (
							<div className="flex justify-between gap-2">
								<span>{m.admin_live_buffer_until_label()}</span>
								<span className="text-foreground font-medium">{formatTimestamp(stream.bufferedUntil)}</span>
							</div>
						)}
					</div>
				</div>
			)}
		</>
	);
}
