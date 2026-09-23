import type { useAdminResources } from "@/client/hooks/use-admin-resources";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";

type ResourceAggregates = NonNullable<NonNullable<ReturnType<typeof useAdminResources>["data"]>["aggregates"]>;

export function ResourceAggregatesSection({ aggregates }: { aggregates: ResourceAggregates }) {
	return (
		<AdminSection title={m.admin_resources_stats_24h()} description={m.admin_resources_usage_stats_description()}>
			<div className="grid gap-4 sm:grid-cols-3">
				<div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-card/60 p-4">
					<p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">{m.admin_resources_cpu()}</p>
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">{m.admin_resources_average_label()}</span>
						<span className="font-mono font-semibold">{m.common_percent_value({ value: aggregates.avgCpu.toFixed(1) })}</span>
					</div>
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">{m.admin_resources_max_label()}</span>
						<span className="font-mono font-semibold text-primary">{m.common_percent_value({ value: aggregates.maxCpu.toFixed(1) })}</span>
					</div>
				</div>
				<div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-card/60 p-4">
					<p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">{m.admin_resources_memory()}</p>
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">{m.admin_resources_average_label()}</span>
						<span className="font-mono font-semibold">{m.common_percent_value({ value: aggregates.avgMemory.toFixed(1) })}</span>
					</div>
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">{m.admin_resources_max_label()}</span>
						<span className="font-mono font-semibold text-primary">
							{m.common_percent_value({ value: aggregates.maxMemory.toFixed(1) })}
						</span>
					</div>
				</div>
				<div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-card/60 p-4">
					<p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">{m.admin_resource_disk()}</p>
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">{m.admin_resources_average_label()}</span>
						<span className="font-mono font-semibold">{m.common_percent_value({ value: aggregates.avgDisk.toFixed(1) })}</span>
					</div>
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">{m.admin_resources_max_label()}</span>
						<span className="font-mono font-semibold text-primary">{m.common_percent_value({ value: aggregates.maxDisk.toFixed(1) })}</span>
					</div>
				</div>
			</div>
		</AdminSection>
	);
}
