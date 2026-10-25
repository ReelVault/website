import type { AdminActiveDeviceItem } from "@reelvault/sdk";
import { formatTimeAgo } from "@/utils/format-utils";
import { DeviceIcon } from "./device-icon";
import { clientLabel } from "./live-activity-utils";

export function ActiveDeviceCard({ device }: { device: AdminActiveDeviceItem }) {
	return (
		<div className="border-border/60 bg-card/50 flex items-center justify-between rounded-xl border p-3 shadow-xs">
			<div className="flex min-w-0 items-center gap-3">
				<div className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
					<DeviceIcon name={device.clientName || device.os || ""} />
				</div>

				<div className="min-w-0">
					<p className="text-foreground truncate text-xs font-semibold">{clientLabel(device.clientName)}</p>
					<p className="text-muted-foreground truncate text-xs">
						{device.userName} {device.ipAddress ? `• ${device.ipAddress}` : ""}
					</p>
				</div>
			</div>

			<span className="text-muted-foreground shrink-0 text-right font-mono text-xs">{formatTimeAgo(device.lastSeenAt)}</span>
		</div>
	);
}
