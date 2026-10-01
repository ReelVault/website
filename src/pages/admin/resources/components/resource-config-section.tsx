import { cn } from "cn";
import type { useAdminResources } from "@/client/hooks/use-admin-resources";
import { Badge } from "@/components/ui/badge";
import { m } from "@/paraglide/messages";

type ResourceConfig = NonNullable<ReturnType<typeof useAdminResources>["data"]>["config"];

/** Compact read-only strip of the monitoring/throttling configuration. */
export function ResourceConfigSection({ config }: { config: ResourceConfig }) {
	const rows = [
		{
			label: m.admin_resources_monitoring_label(),
			node: (
				<Badge
					variant="outline"
					className={cn("text-xs", {
						"border-success/30 bg-success/10 text-success": config.monitoringEnabled,
						"border-muted-foreground/30 bg-muted/10 text-muted-foreground": !config.monitoringEnabled,
					})}
				>
					{config.monitoringEnabled ? m.admin_resources_enabled() : m.plugins_webhooks_disabled()}
				</Badge>
			),
		},
		{
			label: m.admin_resources_dynamic_throttling(),
			node: (
				<Badge
					variant="outline"
					className={cn("text-xs", {
						"border-success/30 bg-success/10 text-success": config.enableDynamicThrottling,
						"border-muted-foreground/30 bg-muted/10 text-muted-foreground": !config.enableDynamicThrottling,
					})}
				>
					{config.enableDynamicThrottling ? m.admin_resources_enabled() : m.plugins_webhooks_disabled()}
				</Badge>
			),
		},
		{
			label: m.admin_resources_memory_threshold(),
			node: (
				<span className="font-mono font-semibold text-foreground">{m.common_percent_value({ value: config.memoryThresholdPercent })}</span>
			),
		},
		{
			label: m.admin_resources_disk_threshold(),
			node: (
				<span className="font-mono font-semibold text-foreground">{m.common_percent_value({ value: config.diskThresholdPercent })}</span>
			),
		},
	];

	return (
		<div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-border/50 bg-muted/20 px-4 py-2.5">
			<span className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">
				{m.admin_resources_monitoring_config()}
			</span>
			{rows.map((row) => (
				<span key={row.label} className="flex items-center gap-2 text-muted-foreground text-xs">
					{row.label}
					{row.node}
				</span>
			))}
		</div>
	);
}
