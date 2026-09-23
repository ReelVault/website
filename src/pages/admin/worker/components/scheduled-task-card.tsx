import type { WorkerCategory, WorkerOperation, WorkerSummary } from "@reelvault/sdk";
import { cn } from "cn";
import {
	Activity,
	AlertCircle,
	CheckCircle2,
	Clock,
	FolderSync,
	HardDriveDownload,
	Puzzle,
	RotateCw,
	Trash2,
	Volume2,
	Wrench,
} from "lucide-react";
import { createElement, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { m } from "@/paraglide/messages";
import { formatTimeAgo } from "@/utils/format-utils";
import { ScheduledTaskActions } from "./scheduled-task-actions";
import { ScheduledTaskTriggersLine } from "./scheduled-task-triggers-line";
import { formatMsDuration, getScheduledTaskMeta } from "./worker-utils";

function lastExecutionIcon(status: string): ReactNode {
	if (status === "failed") return <AlertCircle className="size-3.5 text-destructive" />;

	if (status === "completed") return <CheckCircle2 className="size-3.5 text-success" />;

	return <Clock className="size-3.5 text-muted-foreground" />;
}

function getTaskIcon(id: string, category: WorkerCategory) {
	if (id.includes("scan")) return FolderSync;

	if (id.includes("refresh")) return RotateCw;

	if (id.includes("error") || id.includes("check")) return Wrench;

	if (id.includes("loudness") || id.includes("audio")) return Volume2;

	if (id.includes("clean") || id.includes("trash")) return Trash2;

	if (id.includes("offline") || id.includes("sync")) return HardDriveDownload;

	if (category === "plugins") return Puzzle;

	return Activity;
}

interface ScheduledTaskCardProps {
	task: WorkerSummary;
	matchingOp?: WorkerOperation;
	runningTaskId?: string;
	cancellingTaskId?: string;
	onRunTask: (taskId: string) => void;
	onCancelTask: (taskId: string) => void;
	onConfigureTriggers: (taskId: string) => void;
}

export function ScheduledTaskCard({
	task,
	matchingOp,
	runningTaskId,
	cancellingTaskId,
	onRunTask,
	onCancelTask,
	onConfigureTriggers,
}: ScheduledTaskCardProps) {
	const metaInfo = getScheduledTaskMeta(task.id);
	const taskTitle = metaInfo.title !== task.id ? metaInfo.title : task.name || task.id;
	const taskDescription = task.description ?? metaInfo.description;
	const icon = createElement(getTaskIcon(task.id, task.category), { className: "size-5" });
	const isRunning = task.stats.active > 0;
	const isQueued = task.stats.waiting > 0 && !isRunning;
	const isBusy = runningTaskId === task.id || cancellingTaskId === task.id;
	const progress = matchingOp?.progressPercent ?? (isRunning ? 0 : 0);

	return (
		<div
			className={cn(
				"group relative rounded-xl border border-border/50 bg-card/40 p-4 transition-[border-color,background-color,color,box-shadow] duration-200 hover:border-border/80 hover:bg-card/70",
				isRunning && "border-primary/40 bg-primary/3 ring-1 ring-primary/20",
			)}
		>
			<div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
				{/* Task Info Left */}
				<div className="flex min-w-0 flex-1 items-start gap-3.5">
					<div
						className={cn(
							"flex size-10 shrink-0 items-center justify-center rounded-xl border shadow-xs transition-colors",
							isRunning
								? "animate-pulse border-primary/40 bg-primary/10 text-primary"
								: "border-border/60 bg-muted/40 text-muted-foreground group-hover:border-border group-hover:text-foreground",
						)}
					>
						{icon}
					</div>

					<div className="flex min-w-0 flex-1 flex-col gap-1.5">
						<div className="flex flex-wrap items-center gap-2">
							<h4 className="font-semibold text-foreground text-sm tracking-tight">{taskTitle}</h4>
							<Badge variant="outline" className="px-1.5 py-0 font-mono text-[10px] text-muted-foreground">
								{task.id}
							</Badge>
							{isRunning && (
								<Badge variant="default" className="h-5 gap-1.5 bg-primary px-2 font-medium text-[10px] text-primary-foreground shadow-xs">
									<span className="size-1.5 animate-ping rounded-full bg-white" /> {m.admin_worker_running_badge()}
								</Badge>
							)}
							{isQueued && (
								<Badge variant="secondary" className="h-5 px-2 text-[10px]">
									{m.admin_workers_queued()}
								</Badge>
							)}
						</div>

						<p className="line-clamp-1 text-muted-foreground text-xs leading-relaxed">{taskDescription}</p>

						{/* Execution history & Triggers line */}
						{!isRunning && (
							<div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-0.5 text-muted-foreground text-xs">
								{task.lastExecution ? (
									<div className="flex flex-col gap-0.5">
										<div className="flex items-center gap-1.5">
											{lastExecutionIcon(task.lastExecution.status)}
											<span>
												{m.admin_workers_last_run({ time: formatTimeAgo(task.lastExecution.startedAt) })}
												{task.lastExecution.durationMs !== undefined && (
													<span className="text-muted-foreground/70">
														{m.admin_workers_last_run_duration({ duration: formatMsDuration(task.lastExecution.durationMs) })}
													</span>
												)}
											</span>
										</div>
										{task.lastExecution.error && (
											<span className="max-w-md truncate font-mono text-[10px] text-destructive" title={task.lastExecution.error}>
												{task.lastExecution.error}
											</span>
										)}
									</div>
								) : (
									<span className="text-[11px] text-muted-foreground/80 italic">{m.admin_workers_never_run()}</span>
								)}

								{/* Triggers Pills */}
								<ScheduledTaskTriggersLine taskId={task.id} triggers={task.triggers} onConfigureTriggers={onConfigureTriggers} />
							</div>
						)}
					</div>
				</div>

				{/* Action Buttons Right */}
				<ScheduledTaskActions
					taskId={task.id}
					isRunning={isRunning}
					isQueued={isQueued}
					isBusy={isBusy}
					onConfigureTriggers={onConfigureTriggers}
					onRunTask={onRunTask}
					onCancelTask={onCancelTask}
				/>
			</div>

			{/* Progress bar when running */}
			{isRunning && (
				<div className="mt-3 flex flex-col gap-1.5 border-border/40 border-t pt-2.5">
					<div className="flex items-center justify-between font-mono text-[11px]">
						<span className="flex items-center gap-1.5 font-medium text-primary">
							<span className="size-1.5 animate-ping rounded-full bg-primary" />
							{m.admin_workers_running_ellipsis()}
						</span>
						<span className="font-semibold text-foreground">{m.common_percent_value({ value: Math.round(progress) })}</span>
					</div>
					<Progress value={progress} className="h-1.5 w-full bg-muted/60" />
				</div>
			)}
		</div>
	);
}
