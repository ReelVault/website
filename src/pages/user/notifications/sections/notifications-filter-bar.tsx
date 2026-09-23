import { Filter, MailOpen } from "lucide-react";
import { AsyncButton } from "@/components/async-button";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { runTransition } from "@/utils/view-transitions";

export type NotificationTabType = "all" | "new_episode" | "security" | "system";

const isNotificationTab = (value: string): value is NotificationTabType =>
	value === "all" || value === "new_episode" || value === "security" || value === "system";

interface NotificationsFilterBarProps {
	activeTab: NotificationTabType;
	onTabChange: (tab: NotificationTabType) => void;
	showUnreadOnly: boolean;
	onToggleUnreadOnly: () => void;
	unreadCount: number;
	isMarkingAllRead: boolean;
	onMarkAllRead: () => Promise<unknown>;
}

export function NotificationsFilterBar({
	activeTab,
	onTabChange,
	showUnreadOnly,
	onToggleUnreadOnly,
	unreadCount,
	isMarkingAllRead,
	onMarkAllRead,
}: NotificationsFilterBarProps) {
	return (
		<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
			<div className="flex flex-wrap items-center gap-3">
				<Tabs
					value={activeTab}
					onValueChange={(value: string) => {
						if (isNotificationTab(value)) {
							runTransition("tab", () => onTabChange(value));
						}
					}}
				>
					<TabsList aria-label={m.user_notification_filter()}>
						<TabsTrigger value="all">{m.common_all()}</TabsTrigger>
						<TabsTrigger value="new_episode">{m.user_new_episodes_tab()}</TabsTrigger>
						<TabsTrigger value="security">{m.user_security()}</TabsTrigger>
						<TabsTrigger value="system">{m.user_system()}</TabsTrigger>
					</TabsList>
				</Tabs>
				<Button
					type="button"
					variant={showUnreadOnly ? "default" : "outline"}
					onClick={onToggleUnreadOnly}
					aria-pressed={showUnreadOnly}
					className="min-h-11 gap-2"
				>
					<Filter data-icon="inline-start" aria-hidden="true" />
					{m.user_unread_only()}
				</Button>
			</div>

			<AsyncButton
				type="button"
				variant="outline"
				className="min-h-11 gap-2 self-start lg:self-auto"
				disabled={unreadCount === 0}
				isPending={isMarkingAllRead}
				pendingLabel={m.common_saving_dots()}
				onClick={() => {
					detach(onMarkAllRead());
				}}
			>
				<MailOpen data-icon="inline-start" aria-hidden="true" />
				{m.admin_markers_mark_all()}
			</AsyncButton>
		</div>
	);
}
