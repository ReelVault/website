import type { TaskTrigger } from "@reelvault/sdk";
import { Trash2 } from "lucide-react";
import { createElement } from "react";
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
		<div className="group border-border/50 bg-card/60 hover:border-border hover:bg-card flex items-center justify-between gap-3 rounded-lg border p-3 transition-[border-color,background-color,color,box-shadow]">
			<div className="flex min-w-0 items-center gap-3">
				<div className="border-border/50 bg-secondary/80 text-foreground flex size-8 shrink-0 items-center justify-center rounded-md border">
					{icon}
				</div>
				<div className="min-w-0">
					<div className="flex items-center gap-2">
						<span className="text-foreground text-xs font-medium">{formatTriggerDescription(trigger)}</span>
						<Badge tone="muted" variant="outline" font="mono">
							{trigger.type}
						</Badge>
					</div>
					{trigger.maxRuntimeMinutes && (
						<p className="text-muted-foreground text-xs">{m.admin_worker_runtime_limit({ minutes: trigger.maxRuntimeMinutes })}</p>
					)}
				</div>
			</div>

			<Button
				tone="muted"
				type="button"
				variant="ghost"
				size="icon-xs"
				onClick={() => onDelete(trigger.id)}
				title={m.admin_worker_delete_trigger()}
			>
				<Trash2 className="size-3.5" />
			</Button>
		</div>
	);
}
