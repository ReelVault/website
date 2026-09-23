import { useState } from "react";
import { useAdminActiveOperations, useAdminJobs } from "@/client/hooks/use-admin-jobs";
import { useScheduledTasks } from "@/client/hooks/use-scheduled-tasks";
import { detach } from "@/lib/detach";
import { WorkerPageHeader } from "./components/worker-page-header";
import { WorkerTabsSection } from "./components/worker-tabs-section";
import type { ItemStatus } from "./components/worker-utils";

export default function AdminWorkerPage() {
	const [autoRefresh, setAutoRefresh] = useState(true);
	const [statusFilter, setStatusFilter] = useState<"all" | ItemStatus>("all");
	const [historyPage, setHistoryPage] = useState(1);

	// Scheduled Tasks Hook
	const {
		tasks,
		isLoading: isTasksLoading,
		isError: isTasksError,
		isRefetching: isTasksRefetching,
		refetch: refetchTasks,
		runTask,
		runningTaskId,
		runCategory,
		runningCategoryId,
		cancelTask,
		cancellingTaskId,
		cancelAllWorkers,
		isCancellingAll,
		updateTriggers,
		isUpdatingTriggers,
	} = useScheduledTasks(autoRefresh);

	// Worker Operations Hook
	const {
		operations,
		stats,
		total,
		totalPages,
		operationsQuery,
		statsQuery,
		isRefetching: isJobsRefetching,
		cancelOperation,
		cancellingOperationId,
		resumeOperation,
		resumingOperationId,
		cancelAllOperations,
		isCancellingAllOperations,
	} = useAdminJobs(undefined, 25, autoRefresh, statusFilter === "all" ? undefined : statusFilter, historyPage);

	const activeOperationsQuery = useAdminActiveOperations(autoRefresh);
	const activeOperations = activeOperationsQuery.data?.data ?? [];

	const workerOperations = operations;
	const workerStats = stats;
	let waiting = 0;
	let active = 0;
	let completed = 0;
	let failed = 0;
	for (const s of workerStats) {
		waiting += s.stats.waiting;
		active += s.stats.active;
		completed += s.stats.completed;
		failed += s.stats.failed;
	}

	const totals = { waiting, active, completed, failed };

	const isActiveLoading = activeOperationsQuery.isLoading || statsQuery.isLoading;
	const isActiveError = activeOperationsQuery.isError || statsQuery.isError;
	const isHistoryLoading = operationsQuery.isLoading || statsQuery.isLoading;
	const isHistoryError = operationsQuery.isError || statsQuery.isError;
	const visibleOperations = workerOperations;

	const tasksStatus = { isLoading: isTasksLoading, isError: isTasksError };
	const statsStatus = { isLoading: statsQuery.isLoading, isError: statsQuery.isError };
	const activeStatus = { isLoading: isActiveLoading, isError: isActiveError };
	const historyStatus = { isLoading: isHistoryLoading, isError: isHistoryError };

	const handleRefreshAll = () => {
		detach(() => refetchTasks());
		detach(() => activeOperationsQuery.refetch());
		detach(() => operationsQuery.refetch());
		detach(() => statsQuery.refetch());
	};

	const isAnyRefetching = isTasksRefetching || isJobsRefetching || activeOperationsQuery.isRefetching;

	return (
		<div className="flex flex-col gap-6">
			{/* Header */}
			<WorkerPageHeader
				autoRefresh={autoRefresh}
				onToggleAutoRefresh={() => setAutoRefresh((v) => !v)}
				onRefreshAll={handleRefreshAll}
				isAnyRefetching={isAnyRefetching}
				totals={totals}
				cancelAllWorkers={() => detach(cancelAllWorkers)}
				isCancellingAll={isCancellingAll}
			/>

			{/* Main Tabs */}
			<WorkerTabsSection
				autoRefresh={autoRefresh}
				tasks={tasks}
				tasksStatus={tasksStatus}
				runTask={runTask}
				runningTaskId={runningTaskId}
				cancelTask={cancelTask}
				cancellingTaskId={cancellingTaskId}
				runCategory={runCategory}
				runningCategoryId={runningCategoryId}
				updateTriggers={updateTriggers}
				isUpdatingTriggers={isUpdatingTriggers}
				activeOperations={activeOperations}
				workerStats={workerStats}
				totals={totals}
				statsStatus={statsStatus}
				activeStatus={activeStatus}
				historyStatus={historyStatus}
				visibleOperations={visibleOperations}
				total={total}
				totalPages={totalPages}
				cancelOperation={cancelOperation}
				cancellingOperationId={cancellingOperationId}
				resumeOperation={resumeOperation}
				resumingOperationId={resumingOperationId}
				cancelAllOperations={() => detach(cancelAllOperations)}
				isCancellingAllOperations={isCancellingAllOperations}
				statusFilter={statusFilter}
				setStatusFilter={setStatusFilter}
				historyPage={historyPage}
				setHistoryPage={setHistoryPage}
				onRefresh={() => {
					detach(() => operationsQuery.refetch());
					detach(() => statsQuery.refetch());
				}}
			/>
		</div>
	);
}
