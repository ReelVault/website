import type { WorkerCategory, WorkerOperation, WorkerSummary } from "@reelvault/sdk";
import { ChevronDown, Loader2, Play } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import type { WorkerRunParams } from "./scheduled-task-actions";
import { ScheduledTaskCard } from "./scheduled-task-card";

export const CATEGORY_NAMES: Record<string, { title: string; description: string }> = {
	library: {
		title: m.admin_workers_category_library(),
		description: m.admin_worker_indexing_jobs(),
	},
	media: {
		title: "Media",
		description: m.admin_worker_technical_analysis(),
	},
	stream: {
		title: "Streaming",
		description: m.admin_worker_session_transcoding(),
	},
	sync: {
		title: m.admin_workers_category_sync(),
		description: m.admin_worker_offline_sync_jobs(),
	},
	system: {
		title: m.admin_workers_category_system(),
		description: m.admin_worker_maintenance_jobs(),
	},
	application: {
		title: m.admin_workers_category_application(),
		description: m.admin_worker_core_jobs(),
	},
	plugins: {
		title: m.admin_nav_plugins(),
		description: m.admin_workers_plugins_jobs_desc(),
	},
	database_optimization: {
		title: m.admin_workers_category_database_optimization(),
		description: m.admin_workers_category_database_optimization_desc(),
	},
	file_cleanup: {
		title: m.admin_workers_category_file_cleanup(),
		description: m.admin_workers_category_file_cleanup_desc(),
	},
	other: {
		title: m.admin_workers_other_jobs(),
		description: m.admin_worker_other_workers(),
	},
};

interface ScheduledTasksCategoryGroupProps {
	category: WorkerCategory;
	tasks: WorkerSummary[];
	activeOperationsByType: Map<string, WorkerOperation>;
	runningTaskId?: string;
	cancellingTaskId?: string;
	runningCategoryId?: string;
	onRunTask: (params: WorkerRunParams) => Promise<unknown>;
	onCancelTask: (taskId: string) => Promise<unknown>;
	onRunCategory: (category: WorkerCategory) => Promise<unknown>;
	onConfigureTriggers: (taskId: string) => void;
}

export function ScheduledTasksCategoryGroup({
	category,
	tasks,
	activeOperationsByType,
	runningTaskId,
	cancellingTaskId,
	runningCategoryId,
	onRunTask,
	onCancelTask,
	onRunCategory,
	onConfigureTriggers,
}: ScheduledTasksCategoryGroupProps) {
	const [expanded, setExpanded] = useState(true);
	if (tasks.length === 0) return null;

	const meta = CATEGORY_NAMES[category] ?? {
		title: category,
		description: m.admin_workers_jobs_in_category({ category }),
	};

	const isRunningCategory = runningCategoryId === category;

	return (
		<section className="flex flex-col gap-3">
			<div className="flex items-center justify-between gap-3">
				<div>
					<div className="flex items-center gap-2">
						<h3 className="font-bold text-foreground text-sm tracking-tight">{meta.title}</h3>
						<Badge variant="secondary" className="px-1.5 py-0 font-mono text-[10px]">
							{tasks.length}
						</Badge>
					</div>
					<p className="text-muted-foreground text-xs">{meta.description}</p>
				</div>
				<div className="flex shrink-0 items-center gap-1.5">
					<Button
						type="button"
						variant="outline"
						size="sm"
						disabled={isRunningCategory}
						onClick={() => detach(onRunCategory(category))}
						className="h-8.5 gap-1.5 border-border/60 text-muted-foreground text-xs hover:bg-secondary hover:text-foreground"
						title={m.admin_workers_run_all()}
					>
						{isRunningCategory ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5 fill-current" />}
						<span>{m.admin_workers_run_all()}</span>
					</Button>
				</div>
			</div>

			<Collapsible open={expanded}>
				<CollapsibleTrigger
					type="button"
					onClick={() => setExpanded((v) => !v)}
					className="flex size-8.5 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
					title={meta.title}
				>
					<ChevronDown className={`size-4 transition-transform ${expanded ? "" : "-rotate-90"}`} />
				</CollapsibleTrigger>
				<CollapsibleContent>
					<div className="flex flex-col gap-2.5">
						{tasks.map((task) => (
							<ScheduledTaskCard
								key={task.id}
								task={task}
								matchingOp={activeOperationsByType.get(task.id)}
								runningTaskId={runningTaskId}
								cancellingTaskId={cancellingTaskId}
								onRunTask={(params) => detach(onRunTask(params))}
								onCancelTask={(taskId) => detach(onCancelTask(taskId))}
								onConfigureTriggers={onConfigureTriggers}
							/>
						))}
					</div>
				</CollapsibleContent>
			</Collapsible>
		</section>
	);
}
