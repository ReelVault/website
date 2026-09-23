import { Activity } from "lucide-react";
import type { ReactNode } from "react";
import type { AdminStats } from "@reelvault/sdk";
import { AppErrorState } from "@/components/app-states";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SkeletonList } from "@/components/ui/skeleton";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { formatMemory } from "./dashboard-utils";

const PRESSURE_STATE: Record<"low" | "medium" | "high" | "critical", { readonly label: string; badgeClass: string; active: boolean }> = {
	low: {
		get label() {
			return m.admin_dashboard_healthy();
		},
		badgeClass: "border-success/30 bg-success/10 text-[10px] text-success",
		active: true,
	},
	medium: {
		get label() {
			return m.admin_dashboard_healthy();
		},
		badgeClass: "border-success/30 bg-success/10 text-[10px] text-success",
		active: true,
	},
	high: {
		get label() {
			return m.admin_dashboard_loaded();
		},
		badgeClass: "border-warning/30 bg-warning/10 text-[10px] text-warning",
		active: false,
	},
	critical: {
		get label() {
			return m.admin_dashboard_critical();
		},
		badgeClass: "border-destructive/30 bg-destructive/10 text-[10px] text-destructive",
		active: false,
	},
};

export function DashboardServerResources({
	stats,
	isPending,
	isError,
	onRetry,
}: {
	stats?: AdminStats;
	isPending: boolean;
	isError: boolean;
	onRetry: () => void;
}) {
	const heapUsed = stats?.memory.heapUsed ?? 0;
	// heapTotal is only the currently allocated heap — V8 grows it on demand,
	// so used/total runs close to 100%. The real ceiling is the heap limit.
	const heapCeiling = stats?.memory.heapLimit ?? stats?.memory.heapTotal ?? 1;
	const heapPercent = Math.min(100, Math.round((heapUsed / heapCeiling) * 100));
	const systemMemory = stats?.systemMemory;
	const pressureState = PRESSURE_STATE[stats?.pressure ?? "low"];

	let resourcesContent: ReactNode;
	if (isPending) {
		resourcesContent = <SkeletonList count={3} itemClassName="h-12 rounded-xl" className="flex flex-col gap-3" />;
	} else if (isError) {
		resourcesContent = <AppErrorState title={m.admin_dashboard_failed_to_fetch_data()} onRetry={onRetry} />;
	} else if (stats) {
		resourcesContent = (
			<div className="flex flex-col gap-4">
				{/* Pasek sterty Heap — live objects vs limit sterty V8 */}
				<div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-card/60 p-4">
					<div className="flex items-center justify-between text-xs">
						<span className="font-medium text-foreground">{m.admin_resources_v8_heap_usage()}</span>
						<span className="font-bold font-mono text-primary tabular-nums">{m.common_percent_value({ value: heapPercent })}</span>
					</div>
					<Progress value={heapPercent} className="h-2" />
					<div className="flex items-center justify-between text-[11px] text-muted-foreground">
						<span>
							{m.admin_dashboard_used_label()} {formatMemory(heapUsed)}
						</span>
						<span>{m.admin_resources_limit_value({ value: formatMemory(heapCeiling) })}</span>
					</div>
				</div>

				{/* Whole-machine RAM bar — from system resource monitoring */}
				{systemMemory && (
					<div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-card/60 p-4">
						<div className="flex items-center justify-between text-xs">
							<span className="font-medium text-foreground">{m.admin_dashboard_system_ram()}</span>
							<span className="font-bold font-mono text-primary tabular-nums">
								{m.common_percent_value({ value: systemMemory.percent })}
							</span>
						</div>
						<Progress value={systemMemory.percent} className="h-2" />
						<div className="flex items-center justify-between text-[11px] text-muted-foreground">
							<span>
								{m.admin_dashboard_used_label_system()} {formatMemory(systemMemory.usedMb * 1024 * 1024)}
							</span>
							<span>
								{m.admin_dashboard_total_label()} {formatMemory(systemMemory.totalMb * 1024 * 1024)}
							</span>
						</div>
					</div>
				)}

				{/* Detailed measurements */}
				<div className="grid grid-cols-2 gap-3">
					<div className="rounded-xl border border-border/50 bg-background/50 p-3.5">
						<p className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">{m.admin_dashboard_rss_memory()}</p>
						<p className="mt-1 font-bold text-foreground text-lg tabular-nums">{formatMemory(stats.memory.rss)}</p>
					</div>
					<div className="rounded-xl border border-border/50 bg-background/50 p-3.5">
						<p className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">{m.admin_resources_array_buffers()}</p>
						<p className="mt-1 font-bold text-foreground text-lg tabular-nums">{formatMemory(stats.memory.arrayBuffers)}</p>
					</div>
				</div>

				<div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 px-3.5 py-2.5 text-xs">
					<span className="flex items-center gap-2 text-muted-foreground">
						<Activity className={pressureState.active ? "size-3.5 text-success" : "size-3.5 text-warning"} />
						{m.admin_dashboard_process_state()}
					</span>
					<Badge variant="outline" className={pressureState.badgeClass}>
						{pressureState.label}
					</Badge>
				</div>
			</div>
		);
	} else {
		resourcesContent = null;
	}

	return (
		<AdminSection
			title={m.admin_dashboard_server_resources_memory()}
			description={m.admin_dashboard_ram_usage_description()}
			className="lg:col-span-1"
		>
			{resourcesContent}
		</AdminSection>
	);
}
