import { Trash2 } from "lucide-react";
import { createElement } from "react";
import type { TaskTrigger } from "reelvault-sdk";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";
import { formatTriggerDescription, getTriggerIcon } from "./trigger-utils";

interface TaskTriggerItemProps {
	trigger: TaskTrigger;
	onDelete: (id: string) => void;
}

export function TaskTriggerItem({ trigger, onDelete }: TaskTriggerItemProps) {
	const icon = createElement(getTriggerIcon(trigger.type), {
		className: "size-3.5 text-muted-foreground transition-colors group-hover:text-primary",
	});

	return (
		<div className="group flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-card/60 p-3 transition-[border-color,background-color,color,box-shadow] hover:border-border hover:bg-card">
			<div className="flex min-w-0 items-center gap-3">
				<div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border/50 bg-secondary/80 text-foreground">
					{icon}
				</div>
				<div className="min-w-0">
					<div className="flex items-center gap-2">
						<span className="font-medium text-foreground text-xs">{formatTriggerDescription(trigger)}</span>
						<Badge variant="outline" className="border-border/60 px-1.5 py-0 font-mono text-[10px] text-muted-foreground uppercase">
							{trigger.type}
						</Badge>
					</div>
					{trigger.maxRuntimeMinutes && (
						<p className="text-[11px] text-muted-foreground">{m.admin_worker_runtime_limit({ minutes: trigger.maxRuntimeMinutes })}</p>
					)}
				</div>
			</div>

			<Button
				type="button"
				variant="ghost"
				size="icon-xs"
				onClick={() => onDelete(trigger.id)}
				title={m.admin_worker_delete_trigger()}
				className="size-7 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
			>
				<Trash2 className="size-3.5" />
			</Button>
		</div>
	);
}
