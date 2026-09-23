import { AlertTriangle, HeartPulse, Shield } from "lucide-react";
import type { AdminRescueState } from "reelvault-sdk";
import { Badge } from "@/components/ui/badge";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { formatFullDateTime } from "@/utils/format-utils";

const PRESSURE_LABELS: Record<AdminRescueState["lastPressure"], string> = {
	low: "Niskie",
	medium: m.admin_resources_average_word(),
	high: "Wysokie",
	critical: "Krytyczne",
};

export function ServerRescueStatus({ rescue }: { rescue?: AdminRescueState | null }) {
	if (!rescue) return null;

	const isRescuing = rescue.state === "rescuing";

	return (
		<AdminSection title={m.admin_resources_rescue_state()} description={m.admin_resources_stall_protection()}>
			{isRescuing && (
				<div className="mb-4 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
					<AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
					<div className="flex-1">
						<p className="font-medium text-destructive">{m.admin_server_rescue_mode()}</p>
						<p className="mt-1 text-muted-foreground text-xs">{m.admin_resources_rescue_workers_stopped()}</p>
					</div>
					<Badge variant="outline" className="shrink-0 border-destructive/30 bg-destructive/10 text-[10px] text-destructive">
						{m.admin_resources_rescue_badge()}
					</Badge>
				</div>
			)}

			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-xl border border-border/50 bg-background/50 p-3.5">
					<p className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">{m.admin_resources_state_label()}</p>
					<div className="mt-1.5 flex items-center gap-2">
						{isRescuing ? <AlertTriangle className="size-4 text-destructive" /> : <HeartPulse className="size-4 text-green-500" />}
						<Badge
							variant="outline"
							className={
								isRescuing
									? "border-destructive/30 bg-destructive/10 text-destructive"
									: "border-green-500/30 bg-green-500/10 text-green-500"
							}
						>
							{isRescuing ? m.admin_resources_state_rescuing() : m.admin_resources_state_healthy()}
						</Badge>
					</div>
				</div>

				<div className="rounded-xl border border-border/50 bg-background/50 p-3.5">
					<p className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">{m.admin_resources_event_loop_lag()}</p>
					<p className="mt-1 font-bold font-mono text-foreground text-lg tabular-nums">
						{m.admin_resources_lag_ms({ value: rescue.lastLagMs })}
					</p>
				</div>

				<div className="rounded-xl border border-border/50 bg-background/50 p-3.5">
					<p className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">{m.admin_resources_system_pressure()}</p>
					<p className="mt-1 font-bold font-mono text-foreground text-lg tabular-nums">{PRESSURE_LABELS[rescue.lastPressure]}</p>
				</div>

				<div className="rounded-xl border border-border/50 bg-background/50 p-3.5">
					<p className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">{m.admin_resources_escalations()}</p>
					<div className="mt-1.5 flex items-center gap-2">
						<Shield className="size-4 text-primary" />
						<span className="font-bold font-mono text-foreground text-lg tabular-nums">{rescue.escalations}</span>
					</div>
				</div>
			</div>

			{rescue.reason && (
				<div className="mt-3 rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-sm">
					<span className="text-muted-foreground">{m.admin_resources_last_reason()} </span>
					<span className="font-medium font-mono text-xs">{rescue.reason}</span>
				</div>
			)}

			{rescue.stateSince > 0 && (
				<p className="mt-2 text-muted-foreground text-xs">
					{m.admin_resources_state_since({ date: formatFullDateTime(rescue.stateSince) })}
				</p>
			)}
		</AdminSection>
	);
}
