import { Play, Settings2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

interface ScheduledTaskActionsProps {
	taskId: string;
	isRunning: boolean;
	isQueued: boolean;
	isBusy: boolean;
	onConfigureTriggers: (taskId: string) => void;
	onRunTask: (taskId: string) => void;
	onCancelTask: (taskId: string) => void;
}

export function ScheduledTaskActions({
	taskId,
	isRunning,
	isQueued,
	isBusy,
	onConfigureTriggers,
	onRunTask,
	onCancelTask,
}: ScheduledTaskActionsProps) {
	return (
		<div className="flex shrink-0 items-center justify-end gap-2 pt-2 sm:pt-0">
			<Button
				type="button"
				variant="outline"
				size="sm"
				onClick={() => onConfigureTriggers(taskId)}
				className="h-8.5 gap-1.5 border-border/60 text-muted-foreground text-xs hover:bg-secondary hover:text-foreground"
				title={m.admin_workers_edit_trigger_schedule()}
			>
				<Settings2 className="size-3.5" />
				<span>{m.admin_workers_schedule_word()}</span>
			</Button>

			{isRunning || isQueued ? (
				<Button
					type="button"
					variant="destructive"
					size="sm"
					disabled={isBusy}
					onClick={() => onCancelTask(taskId)}
					className="h-8.5 gap-1.5 font-medium text-xs"
				>
					<Square className="size-3.5 fill-current" />
					<span>{m.admin_workers_stop_word()}</span>
				</Button>
			) : (
				<Button
					type="button"
					variant="default"
					size="sm"
					disabled={isBusy}
					onClick={() => onRunTask(taskId)}
					className="h-8.5 gap-1.5 font-medium text-xs shadow-xs"
				>
					<Play className="size-3.5 fill-current" />
					<span>{m.admin_workers_run_word()}</span>
				</Button>
			)}
		</div>
	);
}
