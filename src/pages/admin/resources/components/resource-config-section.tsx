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
				<Badge variant={config.monitoringEnabled ? "success" : "muted"}>
					{config.monitoringEnabled ? m.admin_resources_enabled() : m.plugins_webhooks_disabled()}
				</Badge>
			),
		},
		{
			label: m.admin_resources_dynamic_throttling(),
			node: (
				<Badge variant={config.enableDynamicThrottling ? "success" : "muted"}>
					{config.enableDynamicThrottling ? m.admin_resources_enabled() : m.plugins_webhooks_disabled()}
				</Badge>
			),
		},
		{
			label: m.admin_resources_memory_threshold(),
			node: (
				<span className="text-foreground font-mono font-semibold">{m.common_percent_value({ value: config.memoryThresholdPercent })}</span>
			),
		},
		{
			label: m.admin_resources_disk_threshold(),
			node: (
				<span className="text-foreground font-mono font-semibold">{m.common_percent_value({ value: config.diskThresholdPercent })}</span>
			),
		},
	];

	return (
		<div className="border-border/50 bg-muted/20 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border px-4 py-2.5">
			<span className="text-muted-foreground text-xs font-medium">{m.admin_resources_monitoring_config()}</span>
			{rows.map((row) => (
				<span key={row.label} className="text-muted-foreground flex items-center gap-2 text-xs">
					{row.label}
					{row.node}
				</span>
			))}
		</div>
	);
}
