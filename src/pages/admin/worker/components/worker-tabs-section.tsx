import type { TaskTrigger, WorkerCategory, WorkerOperation, WorkerSummary } from "@reelvault/sdk";
import { CalendarClock, ListTree } from "lucide-react";
import { lazy, Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { m } from "@/paraglide/messages";
import type { WorkerRunParams } from "./scheduled-task-actions";
import type { WorkerTotals } from "./worker-queue-operations-tab";
import { WorkerScheduledTasksTab } from "./worker-scheduled-tasks-tab";
import type { WorkerStatsItem } from "./worker-stats-grid";
import type { ItemStatus } from "./worker-utils";

// Heavy tab (stats + queues + history + dialog) — the code loads on first tab open.
const LazyWorkerQueueOperationsTab = lazy(async () => {
	const mod = await import("./worker-queue-operations-tab");

	return { default: mod.WorkerQueueOperationsTab };
});

export type { WorkerTotals };

/**
 * Main worker-page block: the "Scheduled tasks" and "Activity & queues" tabs
 * (stats, active operations/history, filters, pagination). The data hooks live
 * in the page — here it is presentation only.
 */
export function WorkerTabsSection({
	autoRefresh,
	tasks,
	tasksStatus,
	runTask,
	runningTaskId,
	cancelTask,
	cancellingTaskId,
	runCategory,
	runningCategoryId,
	updateTriggers,
	isUpdatingTriggers,
	activeOperations,
	workerStats,
	totals,
	activeStatus,
	statsStatus,
	historyStatus,
	visibleOperations,
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
}: {
	autoRefresh: boolean;
	tasks: WorkerSummary[];
	tasksStatus: { isLoading: boolean; isError: boolean };
	runTask: (params: WorkerRunParams) => Promise<unknown>;
	runningTaskId?: string;
	cancelTask: (taskId: string) => Promise<unknown>;
	cancellingTaskId?: string;
	runCategory: (category: WorkerCategory) => Promise<unknown>;
	runningCategoryId?: string;
	updateTriggers: (input: { taskId: string; triggers: TaskTrigger[] }) => Promise<unknown>;
	isUpdatingTriggers: boolean;
	activeOperations: WorkerOperation[];
	workerStats: WorkerStatsItem[];
	totals: WorkerTotals;
	statsStatus: { isLoading: boolean; isError: boolean };
	activeStatus: { isLoading: boolean; isError: boolean };
	historyStatus: { isLoading: boolean; isError: boolean };
	visibleOperations: WorkerOperation[];
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
}) {
	return (
		<Tabs defaultValue="tasks" className="flex flex-col gap-6">
			<TabsList className="grid h-12 w-full max-w-md grid-cols-2 rounded-xl border border-border/60 bg-muted/40 p-1.5 max-sm:h-14 max-sm:max-w-full">
				<TabsTrigger value="tasks" className="flex items-center gap-2 rounded-lg font-semibold text-sm">
					<CalendarClock className="size-4" />
					<span>{m.admin_workers_scheduled_tab()}</span>
					<Badge variant="secondary" className="px-1.5 py-0 font-mono text-[10px]">
						{tasks.length}
					</Badge>
				</TabsTrigger>
				<TabsTrigger value="queue" className="flex items-center gap-2 rounded-lg font-semibold text-sm">
					<ListTree className="size-4" />
					<span>{m.admin_worker_activity_queues()}</span>
					{activeOperations.length > 0 ? (
						<Badge variant="default" className="bg-primary px-1.5 py-0 font-mono text-[10px] text-primary-foreground">
							{activeOperations.length}
						</Badge>
					) : (
						<Badge variant="secondary" className="px-1.5 py-0 font-mono text-[10px]">
							{0}
						</Badge>
					)}
				</TabsTrigger>
			</TabsList>

			{/* 1. SCHEDULED TASKS */}
			<WorkerScheduledTasksTab
				tasks={tasks}
				tasksStatus={tasksStatus}
				activeOperations={activeOperations}
				runTask={runTask}
				runningTaskId={runningTaskId}
				cancelTask={cancelTask}
				cancellingTaskId={cancellingTaskId}
				runCategory={runCategory}
				runningCategoryId={runningCategoryId}
				updateTriggers={updateTriggers}
				isUpdatingTriggers={isUpdatingTriggers}
			/>

			{/* 2. ACTIVITY & QUEUES — base-ui mounts the panel on activation, so the chunk loads on first click */}
			<Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-muted" />}>
				<LazyWorkerQueueOperationsTab
					autoRefresh={autoRefresh}
					workerStats={workerStats}
					totals={totals}
					statsStatus={statsStatus}
					activeOperations={activeOperations}
					activeStatus={activeStatus}
					visibleOperations={visibleOperations}
					historyStatus={historyStatus}
					total={total}
					totalPages={totalPages}
					cancelOperation={cancelOperation}
					cancellingOperationId={cancellingOperationId}
					resumeOperation={resumeOperation}
					resumingOperationId={resumingOperationId}
					cancelAllOperations={cancelAllOperations}
					isCancellingAllOperations={isCancellingAllOperations}
					statusFilter={statusFilter}
					setStatusFilter={setStatusFilter}
					historyPage={historyPage}
					setHistoryPage={setHistoryPage}
					onRefresh={onRefresh}
				/>
			</Suspense>
		</Tabs>
	);
}
