import { cn } from "cn";
import type { useAdminResources } from "@/client/hooks/use-admin-resources";
import { Badge } from "@/components/ui/badge";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";

type ResourceConfig = NonNullable<ReturnType<typeof useAdminResources>["data"]>["config"];

export function ResourceConfigSection({ config }: { config: ResourceConfig }) {
	return (
		<AdminSection title={m.admin_resources_monitoring_config()} description={m.admin_resources_threshold_params()}>
			<div className="grid gap-4 sm:grid-cols-2">
				<div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/50 px-4 py-3 text-sm">
					<span className="text-muted-foreground">{m.admin_resources_monitoring_label()}</span>
					<Badge
						variant="outline"
						className={cn("text-xs", {
							"border-success/30 bg-success/10 text-success": config.monitoringEnabled,
							"border-muted-foreground/30 bg-muted/10 text-muted-foreground": !config.monitoringEnabled,
						})}
					>
						{config.monitoringEnabled ? m.admin_resources_enabled() : m.plugins_webhooks_disabled()}
					</Badge>
				</div>
				<div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/50 px-4 py-3 text-sm">
					<span className="text-muted-foreground">{m.admin_resources_dynamic_throttling()}</span>
					<Badge
						variant="outline"
						className={cn("text-xs", {
							"border-success/30 bg-success/10 text-success": config.enableDynamicThrottling,
							"border-muted-foreground/30 bg-muted/10 text-muted-foreground": !config.enableDynamicThrottling,
						})}
					>
						{config.enableDynamicThrottling ? m.admin_resources_enabled() : m.plugins_webhooks_disabled()}
					</Badge>
				</div>
				<div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/50 px-4 py-3 text-sm">
					<span className="text-muted-foreground">{m.admin_resources_memory_threshold()}</span>
					<span className="font-mono font-semibold text-foreground">
						{m.common_percent_value({ value: config.memoryThresholdPercent })}
					</span>
				</div>
				<div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/50 px-4 py-3 text-sm">
					<span className="text-muted-foreground">{m.admin_resources_disk_threshold()}</span>
					<span className="font-mono font-semibold text-foreground">{m.common_percent_value({ value: config.diskThresholdPercent })}</span>
				</div>
			</div>
		</AdminSection>
	);
}
