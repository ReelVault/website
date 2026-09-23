import type { AdminActiveDeviceItem } from "@reelvault/sdk";
import { formatTimeAgo } from "@/utils/format-utils";
import { DeviceIcon } from "./device-icon";
import { clientLabel } from "./live-activity-utils";

export function ActiveDeviceCard({ device }: { device: AdminActiveDeviceItem }) {
	return (
		<div className="flex items-center justify-between rounded-xl border border-border/60 bg-card/50 p-3 shadow-xs">
			<div className="flex min-w-0 items-center gap-3">
				<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
					<DeviceIcon name={device.clientName || device.os || ""} />
				</div>

				<div className="min-w-0">
					<p className="truncate font-semibold text-foreground text-xs">{clientLabel(device.clientName)}</p>
					<p className="truncate text-[10px] text-muted-foreground">
						{device.userName} {device.ipAddress ? `• ${device.ipAddress}` : ""}
					</p>
				</div>
			</div>

			<span className="shrink-0 text-right font-mono text-[10px] text-muted-foreground">{formatTimeAgo(device.lastSeenAt)}</span>
		</div>
	);
}
