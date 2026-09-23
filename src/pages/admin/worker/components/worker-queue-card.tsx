import { cn } from "cn";
import { Cog, Layers, Puzzle, Sparkles, Volume2, Wrench } from "lucide-react";
import { createElement, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { m } from "@/paraglide/messages";
import type { WorkerStatsItem } from "./worker-stats-grid";
import { formatMsDuration, getWorkerMeta } from "./worker-utils";

function getWorkerIcon(workerId: string) {
	if (workerId.includes("scan") || workerId.includes("ingest") || workerId.includes("analysis")) return Layers;

	if (workerId.includes("image")) return Sparkles;

	if (workerId.includes("loudness") || workerId.includes("audio")) return Volume2;

	if (workerId.includes("error") || workerId.includes("check")) return Wrench;

	if (workerId.startsWith("org.reelvault.")) return Puzzle;

	return Cog;
}

interface WorkerQueueCardProps {
	worker: WorkerStatsItem;
}

export function WorkerQueueCard({ worker }: WorkerQueueCardProps) {
	const meta = getWorkerMeta(worker.id);
	const icon = createElement(getWorkerIcon(worker.id), { className: "size-4" });
	const isBusy = worker.stats.active > 0 || worker.stats.waiting > 0;
	const hasFailed = worker.stats.failed > 0;
	// Built-in workers ship no name (server sends the id); the catalog owns
	// the label. Plugin workers keep their plugin-provided name.
	const displayName = worker.name && worker.name !== worker.id ? worker.name : meta.title;

	let statusBadge: ReactNode;
	if (worker.stats.active > 0) {
		statusBadge = (
			<Badge variant="default" className="h-5 shrink-0 gap-1 bg-primary px-1.5 font-mono text-[10px] text-primary-foreground">
				<span className="size-1.5 animate-ping rounded-full bg-white" />
				{m.admin_worker_active_of_concurrency({ active: worker.stats.active, concurrency: worker.concurrency })}
			</Badge>
		);
	} else if (worker.stats.waiting > 0) {
		statusBadge = (
			<Badge variant="secondary" className="h-5 shrink-0 border border-warning/30 bg-warning/10 px-1.5 font-mono text-[10px] text-warning">
				{m.admin_worker_queue_label({ count: worker.stats.waiting })}
			</Badge>
		);
	} else {
		statusBadge = (
			<Badge variant="outline" className="h-5 shrink-0 border-border/50 font-normal text-[10px] text-muted-foreground/80">
				{m.components_status_idle()}
			</Badge>
		);
	}

	return (
		<article
			className={cn(
				"group relative flex flex-col justify-between rounded-xl border p-3.5 transition-[border-color,background-color,color,box-shadow] duration-200",
				isBusy
					? "border-primary/40 bg-primary/2 shadow-xs ring-1 ring-primary/15"
					: "border-border/50 bg-card/40 hover:border-border/80 hover:bg-card/70",
			)}
		>
			{/* Header */}
			<div className="flex items-start justify-between gap-2.5">
				<div className="flex min-w-0 items-center gap-2.5">
					<div
						className={cn(
							"flex size-8 shrink-0 items-center justify-center rounded-lg border shadow-xs transition-colors",
							isBusy
								? "border-primary/40 bg-primary/10 text-primary"
								: "border-border/60 bg-muted/40 text-muted-foreground group-hover:text-foreground",
						)}
					>
						{icon}
					</div>
					<div className="min-w-0">
						<h4 className="truncate font-semibold text-foreground text-xs tracking-tight" title={displayName}>
							{displayName}
						</h4>
						<span className="block truncate font-mono text-[10px] text-muted-foreground" title={worker.id}>
							{worker.id}
						</span>
					</div>
				</div>

				{/* Status Badge */}
				{statusBadge}
			</div>

			{/* Metrics Bar */}
			<div className="mt-3 grid grid-cols-2 gap-1.5 border-border/40 border-t pt-2.5 font-mono text-[11px]">
				<div className="flex items-center justify-between rounded-md bg-muted/30 px-2 py-1 text-muted-foreground">
					<span className="text-[10px] text-muted-foreground/80">{m.admin_worker_threads_label()}</span>
					<span className="font-semibold text-foreground">{worker.concurrency}</span>
				</div>
				<div className="flex items-center justify-between rounded-md bg-muted/30 px-2 py-1 text-muted-foreground">
					<span className="text-[10px] text-muted-foreground/80">{m.admin_worker_limit_label()}</span>
					<span className="font-medium text-foreground">{formatMsDuration(worker.timeoutMs)}</span>
				</div>
				<div className="flex items-center justify-between rounded-md bg-muted/30 px-2 py-1 text-muted-foreground">
					<span className="text-[10px] text-muted-foreground/80">{m.admin_worker_finished_colon()}</span>
					<span className="font-semibold text-success tabular-nums">{worker.stats.completed}</span>
				</div>
				<div
					className={cn(
						"flex items-center justify-between rounded-md px-2 py-1 text-muted-foreground",
						hasFailed ? "bg-destructive/10 font-semibold text-destructive" : "bg-muted/30",
					)}
				>
					<span className="text-[10px]">{m.admin_worker_errors_label()}</span>
					<span className="tabular-nums">{worker.stats.failed}</span>
				</div>
			</div>
		</article>
	);
}
