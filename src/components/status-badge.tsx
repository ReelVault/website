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

const statusVariant: Record<Status, ComponentProps<typeof Badge>["variant"]> = {
	idle: "outline",
	pending: "secondary",
	running: "primary",
	completed: "success",
	success: "success",
	warning: "warning",
	error: "destructive",
	cancelled: "muted",
};

export function StatusBadge({ status, label, ...props }: ComponentProps<typeof Badge> & { status: Status; label?: string }) {
	return (
		<Badge variant={statusVariant[status]} {...props}>
			{label ?? statusLabels[status]}
		</Badge>
	);
}
