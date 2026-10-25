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
	activeTotal,
	activeStatus,
	onInspect,
}: {
	autoRefresh: boolean;
	activeOperations: WorkerOperation[];
	activeTotal: number;
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
					<Badge variant="secondary" font="mono" size="count">
						{activeTotal}
					</Badge>
				}
				actions={
					activeOperations.length > 0 && (
						<Button
							variant="warning"
							size="sm"
							type="button"
							onClick={() => detach(cancelAll.mutateAsync)}
							disabled={cancelAll.isPending}
							className="cursor-pointer"
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
							<Skeleton className="h-28 w-full" />
							<Skeleton className="h-28 w-full" />
						</div>
					)}

					{activeStatus.isError && (
						<AppErrorState title={m.admin_worker_active_ops_error()} description={m.admin_worker_failed_to_fetch_active()} />
					)}

					{!(activeStatus.isLoading || activeStatus.isError) && activeOperations.length === 0 && (
						<div className="border-border/70 bg-card/30 flex flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center">
							<div className="bg-muted/60 text-muted-foreground mb-2.5 flex size-10 items-center justify-center rounded-full">
								<CheckCircle2 className="text-success size-5" />
							</div>
							<p className="text-foreground text-xs font-medium">{m.admin_workers_no_active_ops_in_queue()}</p>
							<p className="text-muted-foreground mt-0.5 max-w-sm text-xs">{m.admin_workers_queues_idle_desc()}</p>
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
