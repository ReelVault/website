import type { AdminProcessPurpose } from "@reelvault/sdk";
import { ChevronDown, Cpu } from "lucide-react";
import { useState } from "react";
import { useAdminProcesses } from "@/client/hooks/use-admin-processes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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

interface WorkerProcessesCardProps {
	autoRefresh: boolean;
}

/**
 * Live view of every child process the server has spawned (ffmpeg streaming and
 * background jobs, ffprobe probes, capability diagnostics) — data from
 * GET /admin/processes, polled while the tab is open.
 */
export function WorkerProcessesCard({ autoRefresh }: WorkerProcessesCardProps) {
	const [expanded, setExpanded] = useState(false);
	const { data, isLoading, isError } = useAdminProcesses(autoRefresh);

	const counts = data?.counts;
	const processes = (data?.processes ?? []).toSorted((a, b) => b.runtimeMs - a.runtimeMs);

	return (
		<section className="rounded-xl border border-border/50 bg-card/40 p-4">
			<div className="flex items-center justify-between gap-3">
				<div>
					<div className="flex items-center gap-2">
						<Cpu className="size-4 text-muted-foreground" />
						<h3 className="font-bold text-foreground text-sm tracking-tight">{m.admin_processes_title()}</h3>
						{counts && (
							<Badge variant="secondary" className="px-1.5 py-0 font-mono text-[10px]">
								{counts.total}
							</Badge>
						)}
					</div>
					<p className="text-muted-foreground text-xs">{m.admin_processes_description()}</p>
				</div>
				{counts && counts.total > 0 && (
					<Button
						type="button"
						onClick={() => setExpanded((v) => !v)}
						className="flex size-8.5 shrink-0 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
						title={m.admin_processes_title()}
					>
						<ChevronDown className={`size-4 transition-transform ${expanded ? "" : "-rotate-90"}`} />
					</Button>
				)}
			</div>

			{isLoading && <Skeleton className="mt-3 h-9 w-full rounded-lg" />}
			{isError && <p className="mt-3 text-destructive text-xs">{m.admin_worker_scheduled_fetch_error()}</p>}

			{counts && (
				<div className="mt-3 flex flex-wrap gap-1.5">
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

			{counts && counts.total === 0 && <p className="mt-3 text-muted-foreground text-xs">{m.admin_processes_empty()}</p>}

			{expanded && processes.length > 0 && (
				<div className="mt-3 flex flex-col divide-y divide-border/40">
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
		</section>
	);
}
