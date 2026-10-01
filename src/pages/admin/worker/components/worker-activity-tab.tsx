import type { WorkerOperation } from "@reelvault/sdk";
import { CheckCircle2, Square } from "lucide-react";
import { useCancelAllWorkerOperations, useWorkerOperationActions } from "@/client/hooks/use-admin-jobs";
import { useWorkerStats } from "@/client/hooks/use-worker-stats";
import { AppErrorState } from "@/components/app-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { detach } from "@/lib/detach";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { WorkerOperationCard } from "./worker-operation-card";
import { WorkerProcessesCard } from "./worker-processes-card";
import { WorkerStatsGrid } from "./worker-stats-grid";

/**
 * Activity tab: queue/pool grid, live child processes and the active
 * operations feed with the scope-level "cancel all" action.
 */
export function WorkerActivityTab({
	autoRefresh,
	activeOperations,
	activeStatus,
	onInspect,
}: {
	autoRefresh: boolean;
	activeOperations: WorkerOperation[];
	activeStatus: { isLoading: boolean; isError: boolean };
	onInspect: (operation: WorkerOperation | null) => void;
}) {
	const statsQuery = useWorkerStats(autoRefresh);
	const cancelAll = useCancelAllWorkerOperations();
	const { cancelOperation, cancellingOperationId } = useWorkerOperationActions();

	return (
		<div className="flex flex-col gap-6">
			<WorkerStatsGrid workerStats={statsQuery.data ?? []} isLoading={statsQuery.isLoading} isError={statsQuery.isError} />

			{/* Live child-process view (ffmpeg/ffprobe) */}
			<WorkerProcessesCard autoRefresh={autoRefresh} />

			<AdminSection
				title={m.admin_worker_worker_operations()}
				description={m.admin_workers_queue_desc()}
				badge={
					<Badge variant="secondary" className="px-1.5 py-0 font-mono text-[10px]">
						{activeOperations.length}
					</Badge>
				}
				actions={
					activeOperations.length > 0 && (
						<Button
							variant="outline"
							size="sm"
							type="button"
							onClick={() => detach(cancelAll.mutateAsync)}
							disabled={cancelAll.isPending}
							className="h-8.5 cursor-pointer gap-1.5 border-warning/40 text-warning text-xs transition-colors hover:bg-warning/10 hover:text-warning"
						>
							<Square className="size-3.5 fill-current" />
							<span>{cancelAll.isPending ? m.common_cancelling() : m.admin_workers_cancel_all_operations()}</span>
						</Button>
					)
				}
			>
				<div className="flex flex-col gap-3">
					{activeStatus.isLoading && (
						<div className="flex flex-col gap-3">
							<Skeleton className="h-28 w-full rounded-xl" />
							<Skeleton className="h-28 w-full rounded-xl" />
						</div>
					)}

					{activeStatus.isError && (
						<AppErrorState title={m.admin_worker_active_ops_error()} description={m.admin_worker_failed_to_fetch_active()} />
					)}

					{!(activeStatus.isLoading || activeStatus.isError) && activeOperations.length === 0 && (
						<div className="flex flex-col items-center justify-center rounded-xl border border-border/70 border-dashed bg-card/30 p-10 text-center">
							<div className="mb-2.5 flex size-10 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
								<CheckCircle2 className="size-5 text-success" />
							</div>
							<p className="font-medium text-foreground text-xs">{m.admin_workers_no_active_ops_in_queue()}</p>
							<p className="mt-0.5 max-w-sm text-[11px] text-muted-foreground">{m.admin_workers_queues_idle_desc()}</p>
						</div>
					)}

					{activeOperations.map((operationItem) => (
						<WorkerOperationCard
							key={operationItem.id}
							operation={operationItem}
							cancelling={cancellingOperationId === operationItem.id}
							onInspect={onInspect}
							onCancel={cancelOperation}
						/>
					))}
				</div>
			</AdminSection>
		</div>
	);
}
