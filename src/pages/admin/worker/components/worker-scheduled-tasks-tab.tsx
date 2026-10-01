import type { WorkerOperation, WorkerSummary } from "@reelvault/sdk";
import { useScheduledTasks } from "@/client/hooks/use-scheduled-tasks";
import { AppEmptyState, AppErrorState } from "@/components/app-states";
import { Skeleton } from "@/components/ui/skeleton";
import { m } from "@/paraglide/messages";
import { ScheduledTasksList } from "./scheduled-tasks-list";

/**
 * Scheduled-tasks tab content. Mutations come from its own useScheduledTasks
 * subscription; the task list itself is passed down from the tabs section so
 * the tab badge and the list always show the same data.
 */
export function WorkerScheduledTasksTab({
	autoRefresh,
	tasks,
	isLoading,
	isError,
	activeOperations,
}: {
	autoRefresh: boolean;
	tasks: WorkerSummary[];
	isLoading: boolean;
	isError: boolean;
	activeOperations: WorkerOperation[];
}) {
	const { runTask, runningTaskId, cancelTask, cancellingTaskId, runCategory, runningCategoryId, updateTriggers, isUpdatingTriggers } =
		useScheduledTasks(autoRefresh);

	if (isLoading) {
		return (
			<div className="flex flex-col gap-4">
				<Skeleton className="h-28 w-full rounded-2xl" />
				<Skeleton className="h-28 w-full rounded-2xl" />
				<Skeleton className="h-28 w-full rounded-2xl" />
			</div>
		);
	}

	if (isError) {
		return <AppErrorState title={m.admin_worker_scheduled_fetch_error()} description={m.admin_worker_failed_to_load_schedule()} />;
	}

	if (tasks.length === 0) {
		return <AppEmptyState title={m.admin_worker_no_registered_jobs()} description={m.admin_worker_no_active_jobs()} />;
	}

	return (
		<ScheduledTasksList
			tasks={tasks}
			activeOperations={activeOperations}
			onRunTask={runTask}
			onCancelTask={cancelTask}
			onRunCategory={runCategory}
			onUpdateTriggers={async (taskId, triggers) => {
				await updateTriggers({ taskId, triggers });
			}}
			runningTaskId={runningTaskId}
			cancellingTaskId={cancellingTaskId}
			runningCategoryId={runningCategoryId}
			isUpdatingTriggers={isUpdatingTriggers}
		/>
	);
}
