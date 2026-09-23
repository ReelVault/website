import type { TaskTrigger, WorkerCategory, WorkerOperation, WorkerSummary } from "@reelvault/sdk";
import { lazy, Suspense, useState } from "react";
import { LazyRender } from "@/components/lazy-render";
import { useDebounce } from "@/hooks/use-debounce";
import { ScheduledTasksCategoryGroup } from "./scheduled-tasks-category-group";
import { ScheduledTasksFilters } from "./scheduled-tasks-filters";
import { getScheduledTaskMeta } from "./worker-utils";

const TaskTriggersDialog = lazy(async () => ({ default: (await import("./task-triggers-dialog")).TaskTriggersDialog }));

const PREFERRED_CATEGORIES = [
	"library",
	"media",
	"stream",
	"sync",
	"system",
	"application",
	"plugins",
	"database_optimization",
	"file_cleanup",
] as const;
const PREFERRED_CATEGORIES_SET = new Set<string>(PREFERRED_CATEGORIES);

interface ScheduledTasksListProps {
	tasks: WorkerSummary[];
	activeOperations?: WorkerOperation[];
	onRunTask: (taskId: string) => Promise<unknown>;
	onCancelTask: (taskId: string) => Promise<unknown>;
	onRunCategory: (category: WorkerCategory) => Promise<unknown>;
	onUpdateTriggers: (taskId: string, triggers: TaskTrigger[]) => Promise<unknown>;
	runningTaskId?: string;
	cancellingTaskId?: string;
	runningCategoryId?: string;
	isUpdatingTriggers?: boolean;
}

export function ScheduledTasksList({
	tasks,
	activeOperations,
	onRunTask,
	onCancelTask,
	onRunCategory,
	onUpdateTriggers,
	runningTaskId,
	cancellingTaskId,
	runningCategoryId,
	isUpdatingTriggers,
}: ScheduledTasksListProps) {
	const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [categoryFilter, setCategoryFilter] = useState<string>("all");

	const debouncedQuery = useDebounce({ value: searchQuery, delay: 250 });
	const q = debouncedQuery.trim().toLowerCase();

	// Filter tasks by search query and category
	const filteredTasks = tasks.filter((task) => {
		if (categoryFilter !== "all" && task.category !== categoryFilter) return false;

		if (q) {
			const meta = getScheduledTaskMeta(task.id);

			return (
				task.name.toLowerCase().includes(q) ||
				task.id.toLowerCase().includes(q) ||
				(task.description?.toLowerCase() ?? "").includes(q) ||
				meta.title.toLowerCase().includes(q)
			);
		}

		return true;
	});

	// Find the current live task object from props so dialog stays updated in real-time
	const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null;

	const cats = new Set<WorkerCategory>();
	for (const t of tasks) {
		cats.add(t.category);
	}

	const allCategories: WorkerCategory[] = [
		...PREFERRED_CATEGORIES.filter((c) => cats.has(c)),
		...[...cats].filter((c) => !PREFERRED_CATEGORIES_SET.has(c)),
	];
	const activeOperationsByType = new Map(activeOperations?.map((op) => [op.type, op]));

	const tasksByCategory = new Map<WorkerCategory, typeof filteredTasks>();
	for (const task of filteredTasks) {
		const cat = task.category;
		const group = tasksByCategory.get(cat);
		if (group) {
			group.push(task);
		} else {
			tasksByCategory.set(cat, [task]);
		}
	}

	return (
		<div className="flex flex-col gap-6">
			{/* Filters & Search Header */}
			<ScheduledTasksFilters
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				categoryFilter={categoryFilter}
				onCategoryFilterChange={setCategoryFilter}
				totalCount={tasks.length}
				scheduledCount={tasks.filter((t) => t.triggers.length > 0).length}
				activeCount={tasks.filter((t) => t.stats.active > 0).length}
			/>

			{/* Task List by Categories */}
			<div className="flex flex-col gap-8">
				{allCategories.map((category) => {
					const categoryTasks = tasksByCategory.get(category);
					if (!categoryTasks || categoryTasks.length === 0) return null;

					return (
						<LazyRender key={category} minHeight={100}>
							{() => (
								<ScheduledTasksCategoryGroup
									category={category}
									tasks={categoryTasks}
									activeOperationsByType={activeOperationsByType}
									runningTaskId={runningTaskId}
									cancellingTaskId={cancellingTaskId}
									runningCategoryId={runningCategoryId}
									onRunTask={onRunTask}
									onCancelTask={onCancelTask}
									onRunCategory={onRunCategory}
									onConfigureTriggers={setSelectedTaskId}
								/>
							)}
						</LazyRender>
					);
				})}
			</div>

			{selectedTaskId && (
				<Suspense fallback={null}>
					<TaskTriggersDialog
						task={selectedTask}
						isOpen={Boolean(selectedTaskId)}
						onClose={() => setSelectedTaskId(null)}
						onSave={async (taskId, triggers) => {
							await onUpdateTriggers(taskId, triggers);
						}}
						isSaving={isUpdatingTriggers}
					/>
				</Suspense>
			)}
		</div>
	);
}
