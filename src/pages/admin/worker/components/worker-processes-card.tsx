import type { AdminProcessPurpose } from "@reelvault/sdk";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useAdminProcesses } from "@/client/hooks/use-admin-processes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { formatMsDuration } from "./worker-utils";

const PURPOSES: AdminProcessPurpose[] = ["streaming", "background", "probe", "diagnostic"];

const PURPOSE_LABELS: Record<AdminProcessPurpose, string> = {
	streaming: m.admin_processes_purpose_streaming(),
	background: m.admin_processes_purpose_background(),
	probe: m.admin_processes_purpose_probe(),
	diagnostic: m.admin_processes_purpose_diagnostic(),
};

const PURPOSE_BADGE_CLASSES: Record<AdminProcessPurpose, string> = {
	streaming: "bg-primary/10 text-primary border-primary/20",
	background: "bg-secondary text-secondary-foreground border-border/60",
	probe: "bg-chart-2/10 text-chart-2 border-chart-2/20",
	diagnostic: "bg-chart-4/10 text-chart-4 border-chart-4/20",
};

/**
 * Live view of every child process the server has spawned (ffmpeg streaming and
 * background jobs, ffprobe probes, capability diagnostics) — data from
 * GET /admin/processes, polled while the tab is open.
 */
export function WorkerProcessesCard({ autoRefresh }: { autoRefresh: boolean }) {
	const [expanded, setExpanded] = useState(false);
	const { data, isLoading, isError } = useAdminProcesses(autoRefresh);

	const counts = data?.counts;
	const processes = (data?.processes ?? []).toSorted((a, b) => b.runtimeMs - a.runtimeMs);

	return (
		<AdminSection
			title={m.admin_processes_title()}
			description={m.admin_processes_description()}
			badge={
				counts && (
					<Badge variant="secondary" className="px-1.5 py-0 font-mono text-[10px]">
						{counts.total}
					</Badge>
				)
			}
			actions={
				counts &&
				counts.total > 0 && (
					<Button
						type="button"
						variant="outline"
						size="icon-sm"
						onClick={() => setExpanded((v) => !v)}
						className="text-muted-foreground hover:text-foreground"
						title={m.admin_processes_title()}
					>
						<ChevronDown className={`size-4 transition-transform ${expanded ? "" : "-rotate-90"}`} />
					</Button>
				)
			}
		>
			<div className="flex flex-col gap-3">
				{isLoading && <Skeleton className="h-9 w-full rounded-lg" />}
				{isError && <p className="text-destructive text-xs">{m.admin_worker_scheduled_fetch_error()}</p>}

				{counts && (
					<div className="flex flex-wrap gap-1.5">
						{PURPOSES.map((purpose) => (
							<Badge
								key={purpose}
								variant="outline"
								className={`gap-1.5 border px-2 py-0.5 font-medium text-[11px] ${PURPOSE_BADGE_CLASSES[purpose]}`}
							>
								{PURPOSE_LABELS[purpose]}
								<span className="font-mono">{counts[purpose]}</span>
							</Badge>
						))}
					</div>
				)}

				{counts && counts.total === 0 && <p className="text-muted-foreground text-xs">{m.admin_processes_empty()}</p>}

				{expanded && processes.length > 0 && (
					<div className="flex flex-col divide-y divide-border/40">
						{processes.map((proc) => (
							<div
								key={`${proc.purpose}-${proc.pid ?? "no-pid"}-${proc.startedAt}`}
								className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
							>
								<div className="flex min-w-0 items-center gap-2">
									<Badge variant="outline" className={`shrink-0 border px-2 py-0.5 text-[11px] ${PURPOSE_BADGE_CLASSES[proc.purpose]}`}>
										{PURPOSE_LABELS[proc.purpose]}
									</Badge>
									{proc.label && <span className="truncate text-muted-foreground text-xs">{proc.label}</span>}
								</div>
								<div className="flex shrink-0 items-center gap-3 font-mono text-[11px] text-muted-foreground">
									{proc.pid != null && <span>{m.admin_processes_pid({ pid: proc.pid })}</span>}
									<span>{formatMsDuration(proc.runtimeMs)}</span>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</AdminSection>
	);
}
