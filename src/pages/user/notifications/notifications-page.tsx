import { useState, ViewTransition } from "react";
import { useNotifications, useUnreadNotificationCount } from "@/client/hooks/use-notifications";
import { AppErrorState } from "@/components/app-states";
import { LazyRender } from "@/components/lazy-render";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { UserPageHeader } from "../components/user-ui";
import { NotificationCard } from "./components/notification-card";
import { NotificationsEmpty } from "./components/notifications-empty";
import { NotificationsLoading } from "./components/notifications-loading";
import { NotificationsFilterBar, type NotificationTabType } from "./sections/notifications-filter-bar";

export default function NotificationsPage() {
	const [activeTab, setActiveTab] = useState<NotificationTabType>("all");
	const [showUnreadOnly, setShowUnreadOnly] = useState(false);
	const { notifications, isLoading, error, refetch, markRead, markAllRead, isMarkingRead, isMarkingAllRead } =
		useNotifications(showUnreadOnly);
	const unreadNotifications = useUnreadNotificationCount();
	const unreadCount = unreadNotifications.data?.count ?? 0;
	const filteredNotifications =
		activeTab === "all" ? notifications : notifications.filter((notification) => notification.type === activeTab);

	return (
		<div className="relative flex flex-col gap-8">
			<UserPageHeader
				eyebrow={m.user_message_center()}
				title={m.user_notifications_heading()}
				description={unreadCount > 0 ? m.user_unread_messages_waiting({ unreadCount }) : m.user_all_under_control()}
			/>

			<div className="flex flex-col gap-8">
				<NotificationsFilterBar
					activeTab={activeTab}
					onTabChange={setActiveTab}
					showUnreadOnly={showUnreadOnly}
					onToggleUnreadOnly={() => setShowUnreadOnly((value) => !value)}
					unreadCount={unreadCount}
					isMarkingAllRead={isMarkingAllRead}
					onMarkAllRead={markAllRead}
				/>

				{/* List — animated only on tab change (addTransitionType "tab"). */}
				<ViewTransition update={{ default: "none", tab: "auto" }}>
					<div className="grid gap-4" role="tabpanel" aria-live="polite">
						{isLoading && <NotificationsLoading />}
						{error && <AppErrorState title={m.user_notifications_fetch_failed()} error={error} onRetry={() => detach(refetch())} />}
						{!(isLoading || error) && filteredNotifications.length === 0 && <NotificationsEmpty unreadOnly={showUnreadOnly} />}
						{filteredNotifications.map((notification) => (
							<LazyRender key={notification.id} minHeight={120}>
								{() => <NotificationCard notification={notification} isMarkingRead={isMarkingRead} onMarkRead={markRead} />}
							</LazyRender>
						))}
					</div>
				</ViewTransition>
			</div>
		</div>
	);
}
