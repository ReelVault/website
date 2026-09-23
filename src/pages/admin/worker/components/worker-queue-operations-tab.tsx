import { Activity, History, Square } from "lucide-react";
import { useState } from "react";
import type { WorkerOperation } from "reelvault-sdk";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { m } from "@/paraglide/messages";
import { WorkerActiveOperationsTab } from "./worker-active-operations-tab";
import { WorkerHistoryOperationsTab } from "./worker-history-operations-tab";
import { WorkerOperationDialog } from "./worker-operation-dialog";
import { WorkerProcessesCard } from "./worker-processes-card";
import type { WorkerStatsItem } from "./worker-stats-grid";
import { WorkerStatsGrid } from "./worker-stats-grid";
import type { ItemStatus } from "./worker-utils";

export interface WorkerTotals {
	waiting: number;
	active: number;
	completed: number;
	failed: number;
}

interface WorkerQueueOperationsTabProps {
	autoRefresh: boolean;
	workerStats: WorkerStatsItem[];
	totals: WorkerTotals;
	statsStatus: { isLoading: boolean; isError: boolean };
	activeOperations: WorkerOperation[];
	activeStatus: { isLoading: boolean; isError: boolean };
	visibleOperations: WorkerOperation[];
	historyStatus: { isLoading: boolean; isError: boolean };
	total: number;
	totalPages: number;
	cancelOperation: (operationId: string) => Promise<unknown>;
	cancellingOperationId: string | null | undefined;
	resumeOperation: (operationId: string) => Promise<unknown>;
	resumingOperationId: string | null | undefined;
	cancelAllOperations: () => void;
	isCancellingAllOperations: boolean;
	statusFilter: "all" | ItemStatus;
	setStatusFilter: (status: "all" | ItemStatus) => void;
	historyPage: number;
	setHistoryPage: (page: number) => void;
	onRefresh: () => void;
}

export function WorkerQueueOperationsTab({
	autoRefresh,
	workerStats,
	totals,
	statsStatus,
	activeOperations,
	activeStatus,
	visibleOperations,
	historyStatus,
	total,
	totalPages,
	cancelOperation,
	cancellingOperationId,
	resumeOperation,
	resumingOperationId,
	cancelAllOperations,
	isCancellingAllOperations,
	statusFilter,
	setStatusFilter,
	historyPage,
	setHistoryPage,
	onRefresh,
}: WorkerQueueOperationsTabProps) {
	const [inspectingOperation, setInspectingOperation] = useState<WorkerOperation | null>(null);
	const workerTimeouts = new Map<string, number>();
	if (inspectingOperation) {
		for (const s of workerStats) {
			workerTimeouts.set(s.id, s.timeoutMs);
		}
	}

	return (
		<TabsContent value="queue" className="flex flex-col gap-6 pt-1">
			{/* Worker Stats & Queues */}
			<WorkerStatsGrid workerStats={workerStats} totals={totals} isLoading={statsStatus.isLoading} isError={statsStatus.isError} />

			{/* Live child-process view (ffmpeg/ffprobe) */}
			<WorkerProcessesCard autoRefresh={autoRefresh} />

			{/* Operations Section */}
			<div className="flex flex-col gap-4 pt-2">
				<div>
					<div className="flex items-center gap-2">
						<h3 className="font-bold text-foreground text-sm tracking-tight">{m.admin_worker_worker_operations()}</h3>
						<Badge variant="secondary" className="px-1.5 py-0 font-mono text-[10px]">
							{total}
						</Badge>
					</div>
					<p className="text-muted-foreground text-xs">{m.admin_workers_queue_desc()}</p>
				</div>

				<Tabs defaultValue="active" className="flex flex-col gap-4">
					<div className="flex flex-col gap-3 border-border/40 border-b pb-3 sm:flex-row sm:items-center sm:justify-between">
						<TabsList className="h-10 rounded-lg border border-border/50 bg-card/60 p-1">
							<TabsTrigger value="active" className="h-8.5 gap-1.5 rounded-md px-3.5 text-sm">
								<Activity className="size-4" />
								<span>{m.common_active_state()}</span>
								<Badge variant="secondary" className="px-1.5 py-0 font-mono text-[10px]">
									{activeOperations.length}
								</Badge>
							</TabsTrigger>
							<TabsTrigger value="history" className="h-8.5 gap-1.5 rounded-md px-3.5 text-sm">
								<History className="size-4" />
								<span>{m.admin_worker_full_history()}</span>
								<Badge variant="secondary" className="px-1.5 py-0 font-mono text-[10px]">
									{total}
								</Badge>
							</TabsTrigger>
						</TabsList>

						{activeOperations.length > 0 && (
							<Button
								variant="outline"
								size="sm"
								type="button"
								onClick={() => cancelAllOperations()}
								disabled={isCancellingAllOperations}
								className="h-8.5 cursor-pointer gap-1.5 border-warning/40 text-warning text-xs transition-colors hover:bg-warning/10 hover:text-warning"
							>
								<Square className="size-3.5 fill-current" />
								<span>{isCancellingAllOperations ? m.common_cancelling() : m.admin_workers_cancel_all_operations()}</span>
							</Button>
						)}
					</div>

					{/* Active Operations View */}
					<WorkerActiveOperationsTab
						activeOperations={activeOperations}
						activeStatus={activeStatus}
						cancellingOperationId={cancellingOperationId}
						onInspect={setInspectingOperation}
						onCancel={cancelOperation}
					/>

					{/* History Operations View */}
					<WorkerHistoryOperationsTab
						total={total}
						totals={totals}
						visibleOperations={visibleOperations}
						historyStatus={historyStatus}
						statusFilter={statusFilter}
						setStatusFilter={setStatusFilter}
						historyPage={historyPage}
						setHistoryPage={setHistoryPage}
						totalPages={totalPages}
						cancellingOperationId={cancellingOperationId}
						onInspect={setInspectingOperation}
						onCancel={cancelOperation}
						resumeOperation={resumeOperation}
						resumingOperationId={resumingOperationId}
					/>
				</Tabs>
			</div>

			{/* OPERATION ITEMS PREVIEW MODAL */}
			<WorkerOperationDialog
				operation={inspectingOperation}
				workerTimeouts={workerTimeouts}
				isOpen={Boolean(inspectingOperation)}
				onClose={() => setInspectingOperation(null)}
				onRefresh={onRefresh}
			/>
		</TabsContent>
	);
}
