import { cn } from "cn";
import { ListChecks, RefreshCw, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { PurgeHistoryAction } from "./purge-history-action";

interface WorkerTotals {
	waiting: number;
	active: number;
	completed: number;
	failed: number;
}

/** Worker page header: title + global refresh bar. */
export function WorkerPageHeader({
	autoRefresh,
	onToggleAutoRefresh,
	onRefreshAll,
	isAnyRefetching,
	totals,
	cancelAllWorkers,
	isCancellingAll,
}: {
	autoRefresh: boolean;
	onToggleAutoRefresh: () => void;
	onRefreshAll: () => void;
	isAnyRefetching: boolean;
	totals: WorkerTotals;
	cancelAllWorkers: () => void;
	isCancellingAll: boolean;
}) {
	return (
		<header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
			<div>
				<AdminPageHeader
					icon={ListChecks}
					eyebrow={m.admin_worker_job_center()}
					title={m.admin_workers_heading()}
					description={m.admin_worker_scheduled_management()}
				/>
			</div>

			{/* Global Live Refresh Bar */}
			<div className="flex flex-wrap items-center gap-2">
				<Button
					type="button"
					variant={autoRefresh ? "secondary" : "outline"}
					size="sm"
					onClick={onToggleAutoRefresh}
					className={cn(
						"h-8 gap-2 text-xs transition-[border-color,background-color,color,box-shadow]",
						autoRefresh && "border-primary/30 bg-primary/10 text-primary",
					)}
				>
					<span
						className={cn(
							"size-1.5 rounded-full transition-[border-color,background-color,color,box-shadow]",
							autoRefresh ? "animate-pulse bg-primary" : "bg-muted-foreground/60",
						)}
					/>
					<span>{autoRefresh ? m.admin_workers_autorefresh_on() : m.admin_workers_autorefresh_off()}</span>
				</Button>

				<Button
					variant="outline"
					size="sm"
					type="button"
					onClick={onRefreshAll}
					disabled={isAnyRefetching}
					className="h-8 gap-1.5 border-border/60 text-muted-foreground text-xs hover:bg-secondary hover:text-foreground"
				>
					<RefreshCw className={cn("size-3.5", isAnyRefetching && "animate-spin text-primary")} />
					<span>{m.common_refresh()}</span>
				</Button>

				<PurgeHistoryAction />

				{totals.waiting > 0 || totals.active > 0 ? (
					<Button
						variant="outline"
						size="sm"
						type="button"
						onClick={() => cancelAllWorkers()}
						disabled={isCancellingAll}
						className="h-8 cursor-pointer gap-1.5 border-warning/40 text-warning text-xs transition-colors hover:bg-warning/10 hover:text-warning"
					>
						<Square className="size-3.5 fill-current" />
						<span>{isCancellingAll ? m.common_cancelling() : m.admin_workers_stop_all()}</span>
					</Button>
				) : null}
			</div>
		</header>
	);
}
