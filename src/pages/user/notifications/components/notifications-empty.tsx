import { AppEmptyState } from "@/components/app-states";
import { m } from "@/paraglide/messages";

export function NotificationsEmpty({ unreadOnly }: { unreadOnly: boolean }) {
	return (
		<AppEmptyState
			title={unreadOnly ? m.user_no_unread() : m.user_no_notifications()}
			description={unreadOnly ? m.user_all_notifications_read() : m.user_no_system_notifications()}
		/>
	);
}
