import { cn } from "cn";
import { AlertTriangle } from "lucide-react";
import type { useAdminResources } from "@/client/hooks/use-admin-resources";
import { Badge } from "@/components/ui/badge";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { formatFullDateTime } from "@/utils/format-utils";
import { translateByKey } from "@/utils/translate-error";
import { getPressureColor } from "./resource-metrics-grid";

type ResourceAlert = NonNullable<NonNullable<ReturnType<typeof useAdminResources>["data"]>["alerts"]>[number];

export function ResourceAlertsSection({ alerts }: { alerts: ResourceAlert[] }) {
	if (alerts.length === 0) return null;

	return (
		<AdminSection title={m.admin_resources_alerts_section()} description={m.admin_resources_threshold_events()}>
			<div className="flex flex-col gap-2">
				{alerts.map((alert) => (
					<div
						key={`${alert.timestamp}-${alert.code}`}
						className={cn("flex items-start gap-3 rounded-xl border p-3.5 text-sm", {
							"border-destructive/30 bg-destructive/10 text-destructive": alert.severity === "critical",
							"border-warning/30 bg-warning/10 text-warning": alert.severity !== "critical",
						})}
					>
						<AlertTriangle className={cn("mt-0.5 size-4 shrink-0", alert.severity === "critical" ? "text-destructive" : "text-warning")} />
						<div className="flex-1">
							<p className="font-medium text-foreground">{translateByKey(alert.code, alert.params)}</p>
							<p className="mt-1 text-muted-foreground text-xs">
								{formatFullDateTime(alert.timestamp)}
								{alert.workerId && (
									<>
										{" "}
										{m.admin_resources_alert_worker_label()} <span className="font-mono">{alert.workerId}</span>
									</>
								)}
							</p>
						</div>
						<Badge variant="outline" className={cn("text-[10px]", getPressureColor(alert.severity === "critical" ? "critical" : "high"))}>
							{alert.severity === "critical" ? m.admin_resources_critical_word() : m.components_status_warning()}
						</Badge>
					</div>
				))}
			</div>
		</AdminSection>
	);
}
