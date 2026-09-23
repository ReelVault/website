import type { TaskTrigger, WorkerCategory, WorkerOperation, WorkerSummary } from "reelvault-sdk";
import { AppEmptyState, AppErrorState } from "@/components/app-states";
import { Skeleton } from "@/components/ui/skeleton";
import { TabsContent } from "@/components/ui/tabs";
import { m } from "@/paraglide/messages";
import { ScheduledTasksList } from "./scheduled-tasks-list";

interface WorkerScheduledTasksTabProps {
	tasks: WorkerSummary[];
	tasksStatus: { isLoading: boolean; isError: boolean };
	activeOperations: WorkerOperation[];
	runTask: (taskId: string) => Promise<unknown>;
	runningTaskId?: string;
	cancelTask: (taskId: string) => Promise<unknown>;
	cancellingTaskId?: string;
	runCategory: (category: WorkerCategory) => Promise<unknown>;
	runningCategoryId?: string;
	updateTriggers: (input: { taskId: string; triggers: TaskTrigger[] }) => Promise<unknown>;
	isUpdatingTriggers: boolean;
}

export function WorkerScheduledTasksTab({
	tasks,
	tasksStatus,
	activeOperations,
	runTask,
	runningTaskId,
	cancelTask,
	cancellingTaskId,
	runCategory,
	runningCategoryId,
	updateTriggers,
	isUpdatingTriggers,
}: WorkerScheduledTasksTabProps) {
	return (
		<TabsContent value="tasks" className="flex flex-col gap-6 pt-1">
			{tasksStatus.isLoading && (
				<div className="flex flex-col gap-4">
					<Skeleton className="h-28 w-full rounded-2xl" />
					<Skeleton className="h-28 w-full rounded-2xl" />
					<Skeleton className="h-28 w-full rounded-2xl" />
				</div>
			)}

			{tasksStatus.isError && (
				<AppErrorState title={m.admin_worker_scheduled_fetch_error()} description={m.admin_worker_failed_to_load_schedule()} />
			)}

			{!(tasksStatus.isLoading || tasksStatus.isError) && tasks.length === 0 && (
				<AppEmptyState title={m.admin_worker_no_registered_jobs()} description={m.admin_worker_no_active_jobs()} />
			)}

			{!(tasksStatus.isLoading || tasksStatus.isError) && tasks.length > 0 && (
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
			)}
		</TabsContent>
	);
}
