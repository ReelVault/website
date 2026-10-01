import type { useAdminResources } from "@/client/hooks/use-admin-resources";
import { m } from "@/paraglide/messages";

type ResourceAggregates = NonNullable<NonNullable<ReturnType<typeof useAdminResources>["data"]>["aggregates"]>;

/**
 * 24h avg/max values, rendered as a plain grid — meant to sit inside the
 * history-chart section, right under the chart.
 */
export function ResourceAggregatesGrid({ aggregates }: { aggregates: ResourceAggregates }) {
	const rows = [
		{ label: m.admin_resources_cpu(), avg: aggregates.avgCpu, max: aggregates.maxCpu },
		{ label: m.admin_resources_memory(), avg: aggregates.avgMemory, max: aggregates.maxMemory },
		{ label: m.admin_resource_disk(), avg: aggregates.avgDisk, max: aggregates.maxDisk },
	];

	return (
		<div className="grid gap-4 border-border/60 border-t pt-4 sm:grid-cols-3">
			{rows.map((row) => (
				<div key={row.label} className="flex flex-col gap-2">
					<p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">{row.label}</p>
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">{m.admin_resources_average_label()}</span>
						<span className="font-mono font-semibold">{m.common_percent_value({ value: row.avg.toFixed(1) })}</span>
					</div>
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">{m.admin_resources_max_label()}</span>
						<span className="font-mono font-semibold text-primary">{m.common_percent_value({ value: row.max.toFixed(1) })}</span>
					</div>
				</div>
			))}
		</div>
	);
}
