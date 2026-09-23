import type { WorkerOperation } from "@reelvault/sdk";
import { cn } from "cn";
import { AppErrorState } from "@/components/app-states";
import { SimplePagination } from "@/components/simple-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { TabsContent } from "@/components/ui/tabs";
import { m } from "@/paraglide/messages";
import { WorkerOperationCard } from "./worker-operation-card";
import type { ItemStatus } from "./worker-utils";

interface WorkerTotals {
	waiting: number;
	active: number;
	completed: number;
	failed: number;
}

interface WorkerHistoryOperationsTabProps {
	total: number;
	totals: WorkerTotals;
	visibleOperations: WorkerOperation[];
	historyStatus: { isLoading: boolean; isError: boolean };
	statusFilter: "all" | ItemStatus;
	setStatusFilter: (status: "all" | ItemStatus) => void;
	historyPage: number;
	setHistoryPage: (page: number) => void;
	totalPages: number;
	cancellingOperationId: string | null | undefined;
	onInspect: (operation: WorkerOperation | null) => void;
	onCancel: (operationId: string) => Promise<unknown>;
	resumeOperation?: (operationId: string) => Promise<unknown>;
	resumingOperationId?: string | null | undefined;
}

export function WorkerHistoryOperationsTab({
	total,
	totals,
	visibleOperations,
	historyStatus,
	statusFilter,
	setStatusFilter,
	historyPage,
	setHistoryPage,
	totalPages,
	cancellingOperationId,
	onInspect,
	onCancel,
	resumeOperation,
	resumingOperationId,
}: WorkerHistoryOperationsTabProps) {
	const filters = [
		{ value: "all", label: m.common_all(), count: total },
		{
			value: "pending",
			label: m.admin_workers_queued(),
			count: totals.waiting,
		},
		{
			value: "running",
			label: m.worker_status_in_progress(),
			count: totals.active,
		},
		{
			value: "completed",
			label: m.admin_worker_finished(),
			count: totals.completed,
		},
		{
			value: "failed",
			label: m.admin_worker_error(),
			count: totals.failed,
		},
		{
			value: "cancelled",
			label: "Anulowane",
			count: 0,
		},
	] as const;

	return (
		<TabsContent value="history" className="flex flex-col gap-4 pt-1">
			{/* Filters */}
			<div className="flex flex-wrap items-center gap-1.5">
				{filters.map((filter) => (
					<button
						key={filter.value}
						type="button"
						onClick={() => {
							setStatusFilter(filter.value);
							setHistoryPage(1);
						}}
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

			{!(historyStatus.isLoading || historyStatus.isError) && visibleOperations.length === 0 && (
				<div className="flex flex-col items-center justify-center rounded-xl border border-border/70 border-dashed bg-card/30 p-8 text-center">
					<p className="font-medium text-foreground text-xs">{m.admin_workers_no_history()}</p>
					<p className="mt-0.5 text-[11px] text-muted-foreground">{m.admin_worker_no_matching_ops()}</p>
				</div>
			)}

			<div className="flex flex-col gap-3">
				{visibleOperations.map((operationItem: WorkerOperation) => (
					<WorkerOperationCard
						key={operationItem.id}
						operation={operationItem}
						cancelling={cancellingOperationId === operationItem.id}
						resuming={resumingOperationId === operationItem.id}
						resumeOperation={resumeOperation}
						onInspect={onInspect}
						onCancel={onCancel}
					/>
				))}
			</div>

			{/* Operation history pagination */}
			<SimplePagination
				variant="admin"
				currentPage={historyPage}
				totalPages={totalPages}
				isLoading={historyStatus.isLoading}
				onPageChange={setHistoryPage}
			/>
		</TabsContent>
	);
}
