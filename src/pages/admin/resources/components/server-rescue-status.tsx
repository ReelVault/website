import type { AdminRescueState } from "@reelvault/sdk";
import { AlertTriangle, HeartPulse, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { m } from "@/paraglide/messages";
import { formatFullDateTime } from "@/utils/format-utils";
import { getPressureLabel } from "./resource-metrics-grid";

/**
 * Stall-protection state. Healthy = a slim strip; rescuing = a prominent
 * destructive banner with the diagnostics that matter during an incident.
 */
export function ServerRescueStatus({ rescue }: { rescue?: AdminRescueState | null }) {
	if (!rescue) return null;

	const isRescuing = rescue.state === "rescuing";

	if (!isRescuing) {
		return (
			<div className="border-border/50 bg-muted/20 text-muted-foreground flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border px-4 py-2.5 text-xs">
				<span className="text-success flex items-center gap-2 font-medium">
					<HeartPulse className="size-4" />
					{m.admin_resources_state_healthy()}
				</span>
				<span>
					{m.admin_resources_event_loop_lag()}{" "}
					<span className="text-foreground font-mono font-semibold">{m.admin_resources_lag_ms({ value: rescue.lastLagMs })}</span>
				</span>
				<span>
					{m.admin_resources_system_pressure()} <span className="text-foreground font-medium">{getPressureLabel(rescue.lastPressure)}</span>
				</span>
				<span>
					{m.admin_resources_escalations()} <span className="text-foreground font-mono font-semibold">{rescue.escalations}</span>
				</span>
				{rescue.stateSince > 0 && <span>{m.admin_resources_state_since({ date: formatFullDateTime(rescue.stateSince) })}</span>}
			</div>
		);
	}

	return (
		<div className="border-destructive/30 bg-destructive/5 rounded-xl border p-4">
			<div className="flex items-start gap-3">
				<AlertTriangle className="text-destructive mt-0.5 size-5 shrink-0" />
				<div className="flex-1">
					<p className="text-destructive flex items-center gap-2 text-sm font-semibold">
						{m.admin_server_rescue_mode()}
						<Badge variant="destructive">{m.admin_resources_rescue_badge()}</Badge>
					</p>
					<p className="text-muted-foreground mt-1 text-xs">{m.admin_resources_rescue_workers_stopped()}</p>
					{rescue.reason && (
						<p className="text-muted-foreground mt-2 font-mono text-xs break-words">
							{m.admin_resources_last_reason()} {rescue.reason}
						</p>
					)}
				</div>
			</div>

			<div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				<div className="border-destructive/20 bg-background/50 rounded-xl border p-3.5">
					<p className="text-muted-foreground text-xs font-medium">{m.admin_resources_state_label()}</p>
					<p className="text-destructive mt-1.5 flex items-center gap-2 text-sm font-semibold">
						<AlertTriangle className="size-4" />
						{m.admin_resources_state_rescuing()}
					</p>
				</div>
				<div className="border-border/50 bg-background/50 rounded-xl border p-3.5">
					<p className="text-muted-foreground text-xs font-medium">{m.admin_resources_event_loop_lag()}</p>
					<p className="text-foreground mt-1 font-mono text-lg font-bold tabular-nums">
						{m.admin_resources_lag_ms({ value: rescue.lastLagMs })}
					</p>
				</div>
				<div className="border-border/50 bg-background/50 rounded-xl border p-3.5">
					<p className="text-muted-foreground text-xs font-medium">{m.admin_resources_system_pressure()}</p>
					<p className="text-foreground mt-1 font-mono text-lg font-bold tabular-nums">{getPressureLabel(rescue.lastPressure)}</p>
				</div>
				<div className="border-border/50 bg-background/50 rounded-xl border p-3.5">
					<p className="text-muted-foreground text-xs font-medium">{m.admin_resources_escalations()}</p>
					<div className="mt-1.5 flex items-center gap-2">
						<Shield className="text-primary size-4" />
						<span className="text-foreground font-mono text-lg font-bold tabular-nums">{rescue.escalations}</span>
					</div>
				</div>
			</div>

			{rescue.stateSince > 0 && (
				<p className="text-muted-foreground mt-3 text-xs">
					{m.admin_resources_state_since({ date: formatFullDateTime(rescue.stateSince) })}
				</p>
			)}
		</div>
	);
}
