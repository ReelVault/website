import type { WorkerOperation } from "@reelvault/sdk";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { cn } from "cn";
import { useAdminJobs } from "@/client/hooks/use-admin-jobs";
import { useWorkerStats } from "@/client/hooks/use-worker-stats";
import { AppErrorState } from "@/components/app-states";
import { SimplePagination } from "@/components/simple-pagination";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { detach } from "@/lib/detach";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { PurgeHistoryAction } from "./purge-history-action";
import { WorkerOperationCard } from "./worker-operation-card";
import type { ItemStatus, WorkerTotals } from "./worker-utils";

type HistoryStatusFilter = "all" | ItemStatus;

/**
 * Operations history tab. Filter + page live in the URL (`?status=`, `?page=`)
 * so a reload or a shared link lands on the same view; the purge action lives
 * here because it is history-scoped.
 */
export function WorkerHistoryTab({ autoRefresh, onInspect }: { autoRefresh: boolean; onInspect: (operation: WorkerOperation) => void }) {
	const { status: statusFilter = "all", page: historyPage = 1 } = useSearch({ from: "/admin/worker" });
	const navigate = useNavigate({ from: "/admin/worker" });

	const setStatusFilter = (value: HistoryStatusFilter) => {
		detach(
			navigate({
				search: (prev) => ({ ...prev, status: value === "all" ? undefined : value, page: undefined }),
				replace: true,
			}),
		);
	};

	const setPage = (next: number) => {
		detach(navigate({ search: (prev) => ({ ...prev, page: next > 1 ? next : undefined }), replace: true }));
	};

	const { operations, total, totalPages, operationsQuery, cancelOperation, cancellingOperationId, resumeOperation, resumingOperationId } =
		useAdminJobs(undefined, 25, autoRefresh, statusFilter === "all" ? undefined : statusFilter, historyPage);

	// Chip counters reflect live queue totals (pending/running/…), same as the
	// KPI strip above the tabs.
	const statsQuery = useWorkerStats(autoRefresh);
	const totals: WorkerTotals = { waiting: 0, active: 0, completed: 0, failed: 0 };
	for (const worker of statsQuery.data ?? []) {
		totals.waiting += worker.stats.waiting;
		totals.active += worker.stats.active;
		totals.completed += worker.stats.completed;
		totals.failed += worker.stats.failed;
	}

	const historyStatus = { isLoading: operationsQuery.isLoading, isError: operationsQuery.isError };
	const filters = [
		{ value: "all", label: m.common_all(), count: total },
		{ value: "pending", label: m.admin_workers_queued(), count: totals.waiting },
		{ value: "running", label: m.worker_status_in_progress(), count: totals.active },
		{ value: "completed", label: m.admin_worker_finished(), count: totals.completed },
		{ value: "failed", label: m.admin_worker_error(), count: totals.failed },
		// Live totals don't track cancellations — the chip works without a count.
		{ value: "cancelled", label: m.admin_workers_status_cancelled_word(), count: 0 },
	] as const;

	return (
		<AdminSection
			title={m.admin_worker_full_history()}
			description={m.admin_workers_queue_desc()}
			badge={
				<Badge variant="secondary" className="px-1.5 py-0 font-mono text-[10px]">
					{total}
				</Badge>
			}
			actions={<PurgeHistoryAction />}
		>
			<div className="flex flex-col gap-4">
				{/* Status filters */}
				<div className="flex flex-wrap items-center gap-1.5">
					{filters.map((filter) => (
						<button
							key={filter.value}
							type="button"
							onClick={() => setStatusFilter(filter.value)}
							className={cn(
								"inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 font-medium text-xs transition-[border-color,background-color,color,box-shadow]",
								statusFilter === filter.value
									? "border-border bg-secondary text-foreground shadow-xs"
									: "border-border/40 bg-card/40 text-muted-foreground hover:bg-muted/40 hover:text-foreground",
							)}
						>
							<span>{filter.label}</span>
							{filter.count > 0 && (
								<span className="font-mono text-[10px] opacity-80">{m.admin_worker_filter_count({ count: filter.count })}</span>
							)}
						</button>
					))}
				</div>

				{historyStatus.isLoading && (
					<div className="flex flex-col gap-3">
						<Skeleton className="h-28 w-full rounded-xl" />
						<Skeleton className="h-28 w-full rounded-xl" />
					</div>
				)}

				{historyStatus.isError && <AppErrorState title={m.admin_worker_data_error()} description={m.admin_worker_failed_to_fetch_list()} />}

				{!(historyStatus.isLoading || historyStatus.isError) && operations.length === 0 && (
					<div className="flex flex-col items-center justify-center rounded-xl border border-border/70 border-dashed bg-card/30 p-8 text-center">
						<p className="font-medium text-foreground text-xs">{m.admin_workers_no_history()}</p>
						<p className="mt-0.5 text-[11px] text-muted-foreground">{m.admin_worker_no_matching_ops()}</p>
					</div>
				)}

				<div className="flex flex-col gap-3">
					{operations.map((operationItem) => (
						<WorkerOperationCard
							key={operationItem.id}
							operation={operationItem}
							cancelling={cancellingOperationId === operationItem.id}
							resuming={resumingOperationId === operationItem.id}
							resumeOperation={resumeOperation}
							onInspect={onInspect}
							onCancel={cancelOperation}
						/>
					))}
				</div>

				<SimplePagination
					variant="admin"
					currentPage={historyPage}
					totalPages={totalPages}
					isLoading={historyStatus.isLoading}
					onPageChange={setPage}
				/>
			</div>
		</AdminSection>
	);
}
