import type { TaskTrigger } from "@reelvault/sdk";
import { m } from "@/paraglide/messages";
import { formatTriggerDescription, getTriggerIcon } from "./triggers/trigger-utils";

interface ScheduledTaskTriggersLineProps {
	taskId: string;
	triggers: TaskTrigger[];
	onConfigureTriggers: (taskId: string) => void;
}

export function ScheduledTaskTriggersLine({ taskId, triggers, onConfigureTriggers }: ScheduledTaskTriggersLineProps) {
	return (
		<div className="flex flex-wrap items-center gap-1.5">
			<span className="text-[11px] text-muted-foreground/60">{m.admin_worker_schedule_label()}</span>
			{triggers.length === 0 ? (
				<button
					type="button"
					onClick={() => onConfigureTriggers(taskId)}
					className="text-[11px] text-primary/80 underline hover:text-primary"
				>
					{m.admin_workers_no_triggers_click()}
				</button>
			) : (
				triggers.map((tr) => {
					const TriggerIcon = getTriggerIcon(tr.type);

					return (
						<button
							key={tr.id}
							type="button"
							onClick={() => onConfigureTriggers(taskId)}
							className="inline-flex items-center gap-1 rounded-md border border-border/50 bg-secondary/50 px-2 py-0.5 font-medium text-[11px] text-secondary-foreground transition-[border-color,background-color,color,box-shadow] hover:border-border hover:bg-secondary"
							title={m.admin_worker_click_to_edit_schedule()}
						>
							<TriggerIcon className="size-3 text-muted-foreground" />
							<span>{formatTriggerDescription(tr)}</span>
						</button>
					);
				})
			)}
		</div>
	);
}
