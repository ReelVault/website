import { cn } from "cn";
import { Activity, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { m } from "@/paraglide/messages";

interface WorkerStatsSummaryKpisProps {
	totals: {
		waiting: number;
		active: number;
		completed: number;
		failed: number;
	};
}

export function WorkerStatsSummaryKpis({ totals }: WorkerStatsSummaryKpisProps) {
	return (
		<div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
			{/* Waiting */}
			<div
				className={cn(
					"flex flex-col justify-between rounded-xl border p-4 transition-[border-color,background-color,color,box-shadow] duration-200",
					totals.waiting > 0
						? "border-warning/30 bg-warning/4 shadow-xs"
						: "border-border/50 bg-card/40 hover:border-border/80 hover:bg-card/70",
				)}
			>
				<div className="flex items-center justify-between">
					<span className="font-medium text-muted-foreground text-xs">{m.admin_workers_queued()}</span>
					<div
						className={cn(
							"flex size-8 items-center justify-center rounded-lg border",
							totals.waiting > 0 ? "border-warning/40 bg-warning/10 text-warning" : "border-border/60 bg-muted/40 text-muted-foreground",
						)}
					>
						<Clock className="size-4" />
					</div>
				</div>
				<div className="mt-3">
					<div className="font-bold text-2xl text-foreground tabular-nums tracking-tight">{totals.waiting}</div>
					<p className="mt-0.5 text-[11px] text-muted-foreground">{m.admin_worker_waiting_for_thread()}</p>
				</div>
			</div>

			{/* Active */}
			<div
				className={cn(
					"flex flex-col justify-between rounded-xl border p-4 transition-[border-color,background-color,color,box-shadow] duration-200",
					totals.active > 0
						? "border-primary/40 bg-primary/5 shadow-xs"
						: "border-border/50 bg-card/40 hover:border-border/80 hover:bg-card/70",
				)}
			>
				<div className="flex items-center justify-between">
					<span className="font-medium text-muted-foreground text-xs">{m.admin_workers_processing_now()}</span>
					<div
						className={cn(
							"flex size-8 items-center justify-center rounded-lg border",
							totals.active > 0 ? "border-primary/40 bg-primary/10 text-primary" : "border-border/60 bg-muted/40 text-muted-foreground",
						)}
					>
						<Activity className={cn("size-4", totals.active > 0 && "animate-pulse")} />
					</div>
				</div>
				<div className="mt-3">
					<div className="flex items-center gap-2 font-bold text-2xl text-foreground tabular-nums tracking-tight">
						{totals.active}
						{totals.active > 0 && (
							<span className="relative flex size-2">
								<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
								<span className="relative inline-flex size-2 rounded-full bg-primary" />
							</span>
						)}
					</div>
					<p className="mt-0.5 text-[11px] text-muted-foreground">{m.admin_workers_active_jobs_desc()}</p>
				</div>
			</div>

			{/* Completed */}
			<div className="flex flex-col justify-between rounded-xl border border-border/50 bg-card/40 p-4 transition-[border-color,background-color,color,box-shadow] duration-200 hover:border-border/80 hover:bg-card/70">
				<div className="flex items-center justify-between">
					<span className="font-medium text-muted-foreground text-xs">{m.admin_worker_finished()}</span>
					<div className="flex size-8 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-success">
						<CheckCircle2 className="size-4" />
					</div>
				</div>
				<div className="mt-3">
					<div className="font-bold text-2xl text-foreground tabular-nums tracking-tight">{totals.completed}</div>
					<p className="mt-0.5 text-[11px] text-muted-foreground">{m.admin_worker_finished_successfully()}</p>
				</div>
			</div>

			{/* Failed */}
			<div
				className={cn(
					"flex flex-col justify-between rounded-xl border p-4 transition-[border-color,background-color,color,box-shadow] duration-200",
					totals.failed > 0
						? "border-destructive/40 bg-destructive/4 shadow-xs"
						: "border-border/50 bg-card/40 hover:border-border/80 hover:bg-card/70",
				)}
			>
				<div className="flex items-center justify-between">
					<span className="font-medium text-muted-foreground text-xs">{m.admin_worker_execution_errors()}</span>
					<div
						className={cn(
							"flex size-8 items-center justify-center rounded-lg border",
							totals.failed > 0
								? "border-destructive/40 bg-destructive/10 text-destructive"
								: "border-border/60 bg-muted/40 text-muted-foreground",
						)}
					>
						<AlertCircle className="size-4" />
					</div>
				</div>
				<div className="mt-3">
					<div className={cn("font-bold text-2xl tabular-nums tracking-tight", totals.failed > 0 ? "text-destructive" : "text-foreground")}>
						{totals.failed}
					</div>
					<p className="mt-0.5 text-[11px] text-muted-foreground">{m.admin_worker_errored_jobs()}</p>
				</div>
			</div>
		</div>
	);
}
