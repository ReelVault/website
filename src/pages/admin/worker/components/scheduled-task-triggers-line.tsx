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
			<span className="text-muted-foreground/60 text-xs">{m.admin_worker_schedule_label()}</span>
			{triggers.length === 0 ? (
				<button type="button" onClick={() => onConfigureTriggers(taskId)} className="text-primary/80 hover:text-primary text-xs underline">
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
							className="border-border/50 bg-secondary/50 text-secondary-foreground hover:border-border hover:bg-secondary inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium transition-[border-color,background-color,color,box-shadow]"
							title={m.admin_worker_click_to_edit_schedule()}
						>
							<TriggerIcon className="text-muted-foreground size-3" />
							<span>{formatTriggerDescription(tr)}</span>
						</button>
					);
				})
			)}
		</div>
	);
}
