import { CheckCircle2 } from "lucide-react";
import type { WorkerOperation } from "@reelvault/sdk";
import { AppErrorState } from "@/components/app-states";
import { Skeleton } from "@/components/ui/skeleton";
import { TabsContent } from "@/components/ui/tabs";
import { m } from "@/paraglide/messages";
import { WorkerOperationCard } from "./worker-operation-card";

interface WorkerActiveOperationsTabProps {
	activeOperations: WorkerOperation[];
	activeStatus: { isLoading: boolean; isError: boolean };
	cancellingOperationId: string | null | undefined;
	onInspect: (operation: WorkerOperation | null) => void;
	onCancel: (operationId: string) => Promise<unknown>;
}

export function WorkerActiveOperationsTab({
	activeOperations,
	activeStatus,
	cancellingOperationId,
	onInspect,
	onCancel,
}: WorkerActiveOperationsTabProps) {
	return (
		<TabsContent value="active" className="flex flex-col gap-3 pt-1">
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

			<div className="flex flex-col gap-3">
				{activeOperations.map((operationItem: WorkerOperation) => (
					<WorkerOperationCard
						key={operationItem.id}
						operation={operationItem}
						cancelling={cancellingOperationId === operationItem.id}
						onInspect={onInspect}
						onCancel={onCancel}
					/>
				))}
			</div>
		</TabsContent>
	);
}
