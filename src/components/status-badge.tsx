import { cn } from "cn";
import type { ComponentProps } from "react";
import { Badge } from "@/components/ui/badge";
import { m } from "@/paraglide/messages";

export type Status = "idle" | "pending" | "running" | "completed" | "success" | "warning" | "error" | "cancelled";

const statusLabels: Record<Status, string> = {
	get idle() {
		return m.components_status_idle();
	},
	get pending() {
		return m.components_status_pending();
	},
	get running() {
		return m.components_status_running();
	},
	get completed() {
		return m.components_status_finished();
	},
	get success() {
		return m.components_status_finished();
	},
	get warning() {
		return m.components_status_warning();
	},
	get error() {
		return m.common_error();
	},
	get cancelled() {
		return m.components_status_cancelled();
	},
};

const statusClasses: Record<Status, string> = {
	idle: "text-muted-foreground",
	pending: "bg-secondary/60 text-secondary-foreground",
	running: "bg-primary/10 text-primary",
	completed: "border-success/30 bg-success/10 text-success",
	success: "border-success/30 bg-success/10 text-success",
	warning: "border-warning/30 bg-warning/10 text-warning",
	error: "border-destructive/30 bg-destructive/10 text-destructive",
	cancelled: "border-border bg-muted text-muted-foreground",
};

function statusVariant(status: Status): "destructive" | "outline" | "secondary" {
	if (status === "error") return "destructive";

	if (status === "idle" || status === "cancelled") return "outline";

	return "secondary";
}

export function StatusBadge({ status, label, className, ...props }: ComponentProps<typeof Badge> & { status: Status; label?: string }) {
	return (
		<Badge variant={statusVariant(status)} className={cn(statusClasses[status], className)} {...props}>
			{label ?? statusLabels[status]}
		</Badge>
	);
}
