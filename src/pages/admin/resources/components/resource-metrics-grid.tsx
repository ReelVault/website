import { cn } from "cn";
import { Activity, Cpu, HardDrive, MemoryStick } from "lucide-react";
import type { useAdminResources } from "@/client/hooks/use-admin-resources";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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

export function ResourceMetricsGrid({ current }: { current: ResourceCurrent }) {
	const activeWorkers = Object.entries(current.workers).filter(([, count]) => count > 0);

	return (
		<div className="flex flex-col gap-4">
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Card className="border-border/80 bg-card/60 shadow-none">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
							{m.admin_resources_cpu()}
						</CardTitle>
						<div className="flex size-7 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
							<Cpu className="size-4" />
						</div>
					</CardHeader>
					<CardContent className="flex flex-col gap-2">
						<div className="font-bold text-2xl tabular-nums">{m.common_percent_value({ value: current.cpu.usedPercent.toFixed(1) })}</div>
						<Progress value={current.cpu.usedPercent} className="h-1.5" />
						<p className="text-muted-foreground text-xs">
							{m.admin_resources_load_average({ load: current.cpu.loadAvg.map((v) => v.toFixed(2)).join(" / ") })}
						</p>
					</CardContent>
				</Card>

				<Card className="border-border/80 bg-card/60 shadow-none">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
							{m.admin_resources_ram()}
						</CardTitle>
						<div className="flex size-7 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
							<MemoryStick className="size-4" />
						</div>
					</CardHeader>
					<CardContent className="flex flex-col gap-2">
						<div className="font-bold text-2xl tabular-nums">{m.common_percent_value({ value: current.memory.percent.toFixed(1) })}</div>
						<Progress value={current.memory.percent} className="h-1.5" />
						<p className="text-muted-foreground text-xs">
							{m.admin_resources_used_of_total({
								used: formatFileSize(current.memory.usedMb * 1024 * 1024),
								total: formatFileSize(current.memory.totalMb * 1024 * 1024),
							})}
						</p>
					</CardContent>
				</Card>

				<Card className="border-border/80 bg-card/60 shadow-none">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
							{m.admin_resource_disk()}
						</CardTitle>
						<div className="flex size-7 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
							<HardDrive className="size-4" />
						</div>
					</CardHeader>
					<CardContent className="flex flex-col gap-2">
						<div className="font-bold text-2xl tabular-nums">{m.common_percent_value({ value: current.disk.percent.toFixed(1) })}</div>
						<Progress value={current.disk.percent} className="h-1.5" />
						<p className="text-muted-foreground text-xs">
							{m.admin_resources_used_of_total({
								used: formatFileSize(current.disk.usedGb * 1024 * 1024 * 1024),
								total: formatFileSize(current.disk.totalGb * 1024 * 1024 * 1024),
							})}
						</p>
					</CardContent>
				</Card>

				<Card className="border-border/80 bg-card/60 shadow-none">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
							{m.admin_resources_pressure()}
						</CardTitle>
						<div className="flex size-7 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
							<Activity className="size-4" />
						</div>
					</CardHeader>
					<CardContent className="flex flex-col gap-2">
						<Badge variant="outline" className={cn("w-fit text-xs", getPressureColor(current.pressure))}>
							{getPressureLabel(current.pressure)}
						</Badge>
						<p className="text-muted-foreground text-xs">
							{m.admin_resources_active_streams()}
							<span className="font-medium font-mono text-foreground">{current.activeStreams}</span>
						</p>
						<p className="text-[11px] text-muted-foreground">{shortTimeFormatter.format(new Date(current.timestamp))}</p>
					</CardContent>
				</Card>
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
