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
			<div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-border/50 bg-muted/20 px-4 py-2.5 text-muted-foreground text-xs">
				<span className="flex items-center gap-2 font-medium text-success">
					<HeartPulse className="size-4" />
					{m.admin_resources_state_healthy()}
				</span>
				<span>
					{m.admin_resources_event_loop_lag()}{" "}
					<span className="font-mono font-semibold text-foreground">{m.admin_resources_lag_ms({ value: rescue.lastLagMs })}</span>
				</span>
				<span>
					{m.admin_resources_system_pressure()} <span className="font-medium text-foreground">{getPressureLabel(rescue.lastPressure)}</span>
				</span>
				<span>
					{m.admin_resources_escalations()} <span className="font-mono font-semibold text-foreground">{rescue.escalations}</span>
				</span>
				{rescue.stateSince > 0 && <span>{m.admin_resources_state_since({ date: formatFullDateTime(rescue.stateSince) })}</span>}
			</div>
		);
	}

	return (
		<div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
			<div className="flex items-start gap-3">
				<AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
				<div className="flex-1">
					<p className="flex items-center gap-2 font-semibold text-destructive text-sm">
						{m.admin_server_rescue_mode()}
						<Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-[10px] text-destructive">
							{m.admin_resources_rescue_badge()}
						</Badge>
					</p>
					<p className="mt-1 text-muted-foreground text-xs">{m.admin_resources_rescue_workers_stopped()}</p>
					{rescue.reason && (
						<p className="mt-2 break-words font-mono text-muted-foreground text-xs">
							{m.admin_resources_last_reason()} {rescue.reason}
						</p>
					)}
				</div>
			</div>

			<div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-xl border border-destructive/20 bg-background/50 p-3.5">
					<p className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">{m.admin_resources_state_label()}</p>
					<p className="mt-1.5 flex items-center gap-2 font-semibold text-destructive text-sm">
						<AlertTriangle className="size-4" />
						{m.admin_resources_state_rescuing()}
					</p>
				</div>
				<div className="rounded-xl border border-border/50 bg-background/50 p-3.5">
					<p className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">{m.admin_resources_event_loop_lag()}</p>
					<p className="mt-1 font-bold font-mono text-foreground text-lg tabular-nums">
						{m.admin_resources_lag_ms({ value: rescue.lastLagMs })}
					</p>
				</div>
				<div className="rounded-xl border border-border/50 bg-background/50 p-3.5">
					<p className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">{m.admin_resources_system_pressure()}</p>
					<p className="mt-1 font-bold font-mono text-foreground text-lg tabular-nums">{getPressureLabel(rescue.lastPressure)}</p>
				</div>
				<div className="rounded-xl border border-border/50 bg-background/50 p-3.5">
					<p className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">{m.admin_resources_escalations()}</p>
					<div className="mt-1.5 flex items-center gap-2">
						<Shield className="size-4 text-primary" />
						<span className="font-bold font-mono text-foreground text-lg tabular-nums">{rescue.escalations}</span>
					</div>
				</div>
			</div>

			{rescue.stateSince > 0 && (
				<p className="mt-3 text-muted-foreground text-xs">
					{m.admin_resources_state_since({ date: formatFullDateTime(rescue.stateSince) })}
				</p>
			)}
		</div>
	);
}
