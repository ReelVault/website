import type { AdminStats } from "@reelvault/sdk";
import { Activity } from "lucide-react";
import type { ReactNode } from "react";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { formatFileSize } from "@/utils/file-utils";

const PRESSURE_STATE: Record<
	"low" | "medium" | "high" | "critical",
	{ readonly label: string; badgeVariant: BadgeVariant; active: boolean }
> = {
	low: {
		get label() {
			return m.admin_dashboard_healthy();
		},
		badgeVariant: "success",
		active: true,
	},
	medium: {
		get label() {
			return m.admin_dashboard_healthy();
		},
		badgeVariant: "success",
		active: true,
	},
	high: {
		get label() {
			return m.admin_dashboard_loaded();
		},
		badgeVariant: "warning",
		active: false,
	},
	critical: {
		get label() {
			return m.admin_dashboard_critical();
		},
		badgeVariant: "destructive",
		active: false,
	},
};

export function DashboardServerResources({ stats }: { stats?: AdminStats }) {
	const heapUsed = stats?.memory.heapUsed ?? 0;
	// heapTotal is only the currently allocated heap — V8 grows it on demand,
	// so used/total runs close to 100%. The real ceiling is the heap limit.
	const heapCeiling = stats?.memory.heapLimit ?? stats?.memory.heapTotal ?? 1;
	const heapPercent = Math.min(100, Math.round((heapUsed / heapCeiling) * 100));
	const systemMemory = stats?.systemMemory;
	const pressureState = PRESSURE_STATE[stats?.pressure ?? "low"];

	let resourcesContent: ReactNode;
	if (stats) {
		resourcesContent = (
			<div className="flex flex-col gap-4">
				{/* V8 heap bar — live objects against the heap limit */}
				<div className="border-border/70 bg-card/60 flex flex-col gap-2 rounded-xl border p-4">
					<div className="flex items-center justify-between text-xs">
						<span className="text-foreground font-medium">{m.admin_resources_v8_heap_usage()}</span>
						<span className="text-primary font-mono font-bold tabular-nums">{m.common_percent_value({ value: heapPercent })}</span>
					</div>
					<Progress value={heapPercent} />
					<div className="text-muted-foreground flex items-center justify-between text-xs">
						<span>
							{m.admin_dashboard_used_label()} {formatFileSize(heapUsed)}
						</span>
						<span>{m.admin_resources_limit_value({ value: formatFileSize(heapCeiling) })}</span>
					</div>
				</div>

				{/* Whole-machine RAM bar — from system resource monitoring */}
				{systemMemory && (
					<div className="border-border/70 bg-card/60 flex flex-col gap-2 rounded-xl border p-4">
						<div className="flex items-center justify-between text-xs">
							<span className="text-foreground font-medium">{m.admin_dashboard_system_ram()}</span>
							<span className="text-primary font-mono font-bold tabular-nums">
								{m.common_percent_value({ value: systemMemory.percent })}
							</span>
						</div>
						<Progress value={systemMemory.percent} />
						<div className="text-muted-foreground flex items-center justify-between text-xs">
							<span>
								{m.admin_dashboard_used_label_system()} {formatFileSize(systemMemory.usedMb * 1024 * 1024)}
							</span>
							<span>
								{m.admin_dashboard_total_label()} {formatFileSize(systemMemory.totalMb * 1024 * 1024)}
							</span>
						</div>
					</div>
				)}

				<div className="grid grid-cols-2 gap-3">
					<div className="border-border/50 bg-background/50 rounded-xl border p-3.5">
						<p className="text-muted-foreground text-xs font-medium">{m.admin_dashboard_rss_memory()}</p>
						<p className="text-foreground mt-1 text-lg font-bold tabular-nums">{formatFileSize(stats.memory.rss)}</p>
					</div>
					<div className="border-border/50 bg-background/50 rounded-xl border p-3.5">
						<p className="text-muted-foreground text-xs font-medium">{m.admin_resources_array_buffers()}</p>
						<p className="text-foreground mt-1 text-lg font-bold tabular-nums">{formatFileSize(stats.memory.arrayBuffers)}</p>
					</div>
				</div>

				<div className="border-border/50 bg-muted/20 flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs">
					<span className="text-muted-foreground flex items-center gap-2">
						<Activity className={pressureState.active ? "text-success size-3.5" : "text-warning size-3.5"} />
						{m.admin_dashboard_process_state()}
					</span>
					<Badge variant={pressureState.badgeVariant}>{pressureState.label}</Badge>
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
