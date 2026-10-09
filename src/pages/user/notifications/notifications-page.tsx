import { useState, ViewTransition } from "react";
import { useNotifications, useNotificationsPage, useUnreadNotificationCount } from "@/client/hooks/use-notifications";
import { AppErrorState } from "@/components/app-states";
import { ConfirmAction } from "@/components/confirm-action";
import { LazyRender } from "@/components/lazy-render";
import { SimplePagination } from "@/components/simple-pagination";
import { Button } from "@/components/ui/button";
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
	const [page, setPage] = useState(1);
	// The list is paged and filtered on the server; the hook keeps the mutations (mark read, dismiss) without a second list request.
	const { markRead, markAllRead, isMarkingRead, isMarkingAllRead, deleteNotification, deleteNotifications, isDismissing } =
		useNotifications(false, { enabled: false });
	const pageQuery = useNotificationsPage({
		page,
		unreadOnly: showUnreadOnly,
		type: activeTab === "all" ? undefined : activeTab,
	});
	const { data, isLoading, error, refetch } = pageQuery;
	const notifications = data?.data ?? [];
	const unreadNotifications = useUnreadNotificationCount();
	const unreadCount = unreadNotifications.data?.count ?? 0;

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
					onTabChange={(tab) => {
						setActiveTab(tab);
						setPage(1);
					}}
					showUnreadOnly={showUnreadOnly}
					onToggleUnreadOnly={() => {
						setShowUnreadOnly((value) => !value);
						setPage(1);
					}}
					unreadCount={unreadCount}
					isMarkingAllRead={isMarkingAllRead}
					onMarkAllRead={markAllRead}
				/>

				{/* List — animated only on tab change (addTransitionType "tab"). */}
				<ViewTransition update={{ default: "none", tab: "auto" }}>
					<div className="grid gap-4" role="tabpanel" aria-live="polite">
						{isLoading && <NotificationsLoading />}
						{error && <AppErrorState title={m.user_notifications_fetch_failed()} error={error} onRetry={() => detach(refetch())} />}
						{!(isLoading || error) && notifications.length === 0 && <NotificationsEmpty unreadOnly={showUnreadOnly} />}
						{notifications.map((notification) => (
							<LazyRender key={notification.id} minHeight={120}>
								{() => (
									<NotificationCard
										notification={notification}
										isMarkingRead={isMarkingRead}
										onMarkRead={markRead}
										isDismissing={isDismissing}
										onDismiss={deleteNotification}
									/>
								)}
							</LazyRender>
						))}
					</div>
				</ViewTransition>

				{notifications.length > 1 && (
					<div className="flex justify-end">
						<ConfirmAction
							trigger={
								<Button variant="outline" size="sm" disabled={isDismissing}>
									{m.user_notifications_dismiss_shown()}
								</Button>
							}
							title={m.user_notifications_dismiss_shown_title({ count: notifications.length })}
							description={m.user_notifications_dismiss_shown_description()}
							confirmLabel={m.user_notifications_dismiss_shown()}
							onConfirm={() => deleteNotifications(notifications.map((notification) => notification.id))}
						/>
					</div>
				)}

				<SimplePagination currentPage={page} totalPages={data?.totalPages ?? 1} isLoading={pageQuery.isFetching} onPageChange={setPage} />
			</div>
		</div>
	);
}
