import { Activity, Cpu, HardDrive, MemoryStick } from "lucide-react";
import type { useAdminResources } from "@/client/hooks/use-admin-resources";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AdminStatCard } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { formatFileSize } from "@/utils/file-utils";
import { shortTimeFormatter } from "@/utils/format-utils";

type ResourceCurrent = NonNullable<NonNullable<ReturnType<typeof useAdminResources>["data"]>["current"]>;

export function getPressureColor(pressure: string) {
	switch (pressure) {
		case "critical":
			return "bg-destructive/10 text-destructive border-destructive/30";
		case "high":
		case "medium":
			return "bg-warning/10 text-warning border-warning/30";
		default:
			return "bg-success/10 text-success border-success/30";
	}
}

export function getPressureLabel(pressure: string) {
	switch (pressure) {
		case "critical":
			return m.admin_resources_critical_word();
		case "high":
			return m.admin_resources_pressure_high();
		case "medium":
			return m.admin_resources_elevated();
		default:
			return m.admin_resources_pressure_normal();
	}
}

function getPressureTone(pressure: string): "success" | "warning" | "destructive" {
	switch (pressure) {
		case "critical":
			return "destructive";
		case "high":
		case "medium":
			return "warning";
		default:
			return "success";
	}
}

function UsageBar({ percent }: { percent: number }) {
	return <Progress value={percent} className="h-1.5" />;
}

export function ResourceMetricsGrid({ current }: { current: ResourceCurrent }) {
	const activeWorkers = Object.entries(current.workers).filter(([, count]) => count > 0);

	return (
		<div className="flex flex-col gap-4">
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				<AdminStatCard
					label={m.admin_resources_cpu()}
					value={m.common_percent_value({ value: current.cpu.usedPercent.toFixed(1) })}
					icon={Cpu}
					description={
						<div className="flex flex-col gap-1.5">
							<UsageBar percent={current.cpu.usedPercent} />
							<span>{m.admin_resources_load_average({ load: current.cpu.loadAvg.map((v) => v.toFixed(2)).join(" / ") })}</span>
						</div>
					}
					tone="default"
				/>
				<AdminStatCard
					label={m.admin_resources_ram()}
					value={m.common_percent_value({ value: current.memory.percent.toFixed(1) })}
					icon={MemoryStick}
					description={
						<div className="flex flex-col gap-1.5">
							<UsageBar percent={current.memory.percent} />
							<span>
								{m.admin_resources_used_of_total({
									used: formatFileSize(current.memory.usedMb * 1024 * 1024),
									total: formatFileSize(current.memory.totalMb * 1024 * 1024),
								})}
							</span>
						</div>
					}
					tone="default"
				/>
				<AdminStatCard
					label={m.admin_resource_disk()}
					value={m.common_percent_value({ value: current.disk.percent.toFixed(1) })}
					icon={HardDrive}
					description={
						<div className="flex flex-col gap-1.5">
							<UsageBar percent={current.disk.percent} />
							<span>
								{m.admin_resources_used_of_total({
									used: formatFileSize(current.disk.usedGb * 1024 * 1024 * 1024),
									total: formatFileSize(current.disk.totalGb * 1024 * 1024 * 1024),
								})}
							</span>
						</div>
					}
					tone="default"
				/>
				<AdminStatCard
					label={m.admin_resources_pressure()}
					value={getPressureLabel(current.pressure)}
					icon={Activity}
					description={
						<div className="flex flex-col gap-1.5">
							<span>
								{m.admin_resources_active_streams()}
								<span className="font-medium font-mono text-foreground">{current.activeStreams}</span>
							</span>
							<span className="text-[11px]">{shortTimeFormatter.format(new Date(current.timestamp))}</span>
						</div>
					}
					tone={getPressureTone(current.pressure)}
				/>
			</div>

			{activeWorkers.length > 0 && (
				<Card className="border-border/80 bg-card/60 shadow-none">
					<CardHeader className="pb-2">
						<CardTitle className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
							{m.admin_resources_active_workers()}
						</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-wrap gap-2">
						{activeWorkers.map(([workerId, count]) => (
							<Badge key={workerId} variant="outline" className="font-mono text-[11px]">
								{m.admin_resources_worker_label({ workerId })} <span className="ml-1 font-semibold text-foreground">{count}</span>
							</Badge>
						))}
					</CardContent>
				</Card>
			)}
		</div>
	);
}
