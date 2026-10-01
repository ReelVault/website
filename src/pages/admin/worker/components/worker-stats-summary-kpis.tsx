import { Activity, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminStatCard } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import type { WorkerTotals } from "./worker-utils";

/** KPI strip above the tabs — always visible, one glance for queue health. */
export function WorkerStatsSummaryKpis({ totals, isLoading, isError }: { totals: WorkerTotals; isLoading: boolean; isError: boolean }) {
	if (isLoading) {
		return (
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				<Skeleton className="h-32 rounded-xl" />
				<Skeleton className="h-32 rounded-xl" />
				<Skeleton className="h-32 rounded-xl" />
				<Skeleton className="h-32 rounded-xl" />
			</div>
		);
	}

	// Tab contents carry their own error states; the strip just hides.
	if (isError) return null;

	return (
		<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
			<AdminStatCard
				label={m.admin_workers_queued()}
				value={totals.waiting}
				icon={Clock}
				description={m.admin_worker_waiting_for_thread()}
				tone={totals.waiting > 0 ? "warning" : "muted"}
			/>
			<AdminStatCard
				label={m.admin_workers_processing_now()}
				value={totals.active}
				icon={Activity}
				description={m.admin_workers_active_jobs_desc()}
				tone={totals.active > 0 ? "default" : "muted"}
			/>
			<AdminStatCard
				label={m.admin_worker_finished()}
				value={totals.completed}
				icon={CheckCircle2}
				description={m.admin_worker_finished_successfully()}
				tone="success"
			/>
			<AdminStatCard
				label={m.admin_worker_execution_errors()}
				value={totals.failed}
				icon={AlertCircle}
				description={m.admin_worker_errored_jobs()}
				tone={totals.failed > 0 ? "destructive" : "muted"}
			/>
		</div>
	);
}
