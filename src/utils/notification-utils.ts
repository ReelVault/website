import type { Notification } from "@reelvault/sdk";
import type { LucideIcon } from "lucide-react";
import { CheckCircle2, CircleAlert, Info, Settings, Tv } from "lucide-react";
import { m } from "@/paraglide/messages";

/** Interpolation value accepted by paraglide message inputs. */
type MessageInputValue = string | number;

/** Converts an unknown JSON field to display text, tolerating only primitives. */
function fieldToText(value: unknown): MessageInputValue {
	if (typeof value === "string") return value;

	if (typeof value === "number") return value;

	return "";
}

/**
 * Resolves localized notification title and body.
 * Server stores template key + interpolation data for structured types.
 */
export function getNotificationText(notification: Notification): { title: string; body: string | null } {
	if (notification.type === "new_episode") {
		const data = notification.data;
		const title = m.notification_new_episode({ showTitle: fieldToText(data.showTitle) });
		const episodeTitle = typeof data.episodeTitle === "string" && data.episodeTitle ? ` „${data.episodeTitle}”` : "";
		const seasonNumber = fieldToText(data.seasonNumber);
		const episodeNumber = fieldToText(data.episodeNumber);
		const body = m.notification_new_episode_body({ seasonNumber, episodeNumber, episodeTitle });

		return { title, body };
	}

	if (notification.type === "update_available") {
		const version = fieldToText(notification.data.version);

		return {
			title:
				notification.data.component === "web"
					? m.notification_update_available_web({ version })
					: m.notification_update_available_server({ version }),
			body: null,
		};
	}

	if (notification.type === "worker_failed") {
		const workerId = fieldToText(notification.data.workerId);

		return { title: m.notifications_title_worker_failed(), body: m.notification_worker_failed({ workerId }) };
	}

	if (notification.type === "update_failed") {
		const component = fieldToText(notification.data.component);

		return { title: m.notifications_title_update_failed(), body: m.notification_update_failed({ component }) };
	}

	return { title: notification.title, body: notification.message ?? null };
}

export function getNotificationIcon(type: string): LucideIcon {
	if (type === "security") return CircleAlert;

	if (type === "update" || type === "update_available") return CheckCircle2;

	if (type === "worker_failed" || type === "update_failed" || type === "resource_alert") return CircleAlert;

	if (type === "system") return Settings;

	if (type === "new_episode") return Tv;

	return Info;
}

type NotificationColorClass =
	| "bg-destructive/10 text-destructive"
	| "bg-success/10 text-success"
	| "bg-warning/10 text-warning"
	| "bg-primary/10 text-primary";

export function getNotificationColor(type: string): NotificationColorClass {
	if (type === "security") return "bg-destructive/10 text-destructive";

	if (type === "update" || type === "update_available") return "bg-success/10 text-success";

	if (type === "new_episode") return "bg-warning/10 text-warning";

	if (type === "worker_failed" || type === "update_failed" || type === "resource_alert") return "bg-destructive/10 text-destructive";

	return "bg-primary/10 text-primary";
}
