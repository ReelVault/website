import { cn } from "cn";
import { ListChecks, RefreshCw, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import type { WorkerTotals } from "./worker-utils";

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
		<AdminPageHeader
			icon={ListChecks}
			eyebrow={m.admin_worker_job_center()}
			title={m.admin_workers_heading()}
			description={m.admin_worker_scheduled_management()}
			actions={
				<div className="flex flex-wrap items-center gap-2">
					<Button type="button" variant={autoRefresh ? "secondary" : "outline"} size="sm" onClick={onToggleAutoRefresh}>
						<span
							className={cn(
								"size-1.5 rounded-full transition-[border-color,background-color,color,box-shadow]",
								autoRefresh ? "bg-primary animate-pulse" : "bg-muted-foreground/60",
							)}
						/>
						<span>{autoRefresh ? m.admin_workers_autorefresh_on() : m.admin_workers_autorefresh_off()}</span>
					</Button>

					<Button tone="muted" variant="outline" size="sm" type="button" onClick={onRefreshAll} disabled={isAnyRefetching}>
						<RefreshCw className={cn("size-3.5", isAnyRefetching && "text-primary animate-spin")} />
						<span>{m.common_refresh()}</span>
					</Button>

					{totals.waiting > 0 || totals.active > 0 ? (
						<Button
							variant="warning"
							size="sm"
							type="button"
							onClick={() => cancelAllWorkers()}
							disabled={isCancellingAll}
							className="cursor-pointer"
						>
							<Square className="size-3.5 fill-current" />
							<span>{isCancellingAll ? m.common_cancelling() : m.admin_workers_stop_all()}</span>
						</Button>
					) : null}
				</div>
			}
		/>
	);
}
