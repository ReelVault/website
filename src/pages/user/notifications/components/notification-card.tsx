import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { Check, Copy } from "lucide-react";
import { createElement } from "react";
import type { Notification } from "reelvault-sdk";
import { SimpleAnimation } from "@/components/simple-animation";
import { Button } from "@/components/ui/button";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuGroup,
	ContextMenuItem,
	ContextMenuLabel,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { copyToClipboard } from "@/utils/clipboard-utils";
import { formatDateTime } from "@/utils/format-utils";
import { getNotificationColor, getNotificationIcon, getNotificationText } from "@/utils/notification-utils";

const handleCopy = async (text: string) => {
	await copyToClipboard(text, m.user_notification_content());
};

interface NotificationCardProps {
	notification: Notification;
	isMarkingRead: boolean;
	onMarkRead: (id: string) => Promise<unknown>;
}

export function NotificationCard({ notification, isMarkingRead, onMarkRead }: NotificationCardProps) {
	const isRead = Boolean(notification.readAt);
	const icon = createElement(getNotificationIcon(notification.type), { "aria-hidden": "true" });
	const { title, body } = getNotificationText(notification);
	// Only navigate to internal app paths — never a protocol-relative or external URL.
	const internalLink = notification.link?.startsWith("/") && !notification.link.startsWith("//") ? notification.link : null;

	return (
		<SimpleAnimation direction="left">
			<ContextMenu>
				<ContextMenuTrigger
					className={cn(
						"group relative block overflow-hidden rounded-2xl border p-5 transition-[background-color,border-color]",
						isRead ? "border-border/60 bg-card/40 hover:bg-card/70" : "border-primary/25 bg-primary/5 hover:bg-primary/10",
					)}
				>
					<div className="flex items-start gap-4 sm:gap-6">
						<div
							className={cn(
								"flex size-11 shrink-0 items-center justify-center rounded-xl text-xl",
								getNotificationColor(notification.type),
							)}
						>
							{icon}
						</div>
						<div className="min-w-0 flex-1">
							<div className="flex flex-wrap items-center justify-between gap-2">
								<h2 className={cn("font-semibold", isRead ? "text-muted-foreground" : "text-foreground")}>{title}</h2>
								<time dateTime={new Date(notification.createdAt).toISOString()} className="font-medium text-[11px] text-muted-foreground">
									{formatDateTime(notification.createdAt)}
								</time>
							</div>
							{body && <p className="wrap-break-word mt-2 max-w-2xl text-muted-foreground text-sm leading-relaxed">{body}</p>}
							<div className="mt-2 flex flex-wrap items-center gap-3">
								{internalLink && (
									<Button
										variant="outline"
										size="sm"
										nativeButton={false}
										render={<Link to={internalLink} />}
										className="h-9 px-3 text-xs sm:h-7 sm:px-2.5"
									>
										{m.user_go_to_item()}
									</Button>
								)}
								{!isRead && (
									<Button
										type="button"
										variant="link"
										size="sm"
										className="h-auto px-0 text-primary text-xs"
										disabled={isMarkingRead}
										onClick={() => {
											detach(onMarkRead(notification.id));
										}}
									>
										{m.user_mark_as_read()}
									</Button>
								)}
							</div>
						</div>
					</div>
				</ContextMenuTrigger>

				<ContextMenuContent className="w-64 border-border bg-popover shadow-xl">
					<ContextMenuGroup>
						<ContextMenuLabel className="truncate font-bold text-foreground text-xs uppercase tracking-wider">{title}</ContextMenuLabel>
					</ContextMenuGroup>
					<ContextMenuSeparator />
					<ContextMenuGroup>
						{!isRead && (
							<ContextMenuItem
								onClick={() => {
									detach(onMarkRead(notification.id));
								}}
								className="cursor-pointer gap-2.5"
							>
								<Check className="size-4 text-primary" />
								<span>{m.components_navbar_mark_read()}</span>
							</ContextMenuItem>
						)}
						{body && (
							<ContextMenuItem
								onClick={() => {
									detach(handleCopy(body));
								}}
								className="cursor-pointer gap-2.5"
							>
								<Copy className="size-4 text-muted-foreground" />
								<span>{m.user_copy_message()}</span>
							</ContextMenuItem>
						)}
					</ContextMenuGroup>
				</ContextMenuContent>
			</ContextMenu>
		</SimpleAnimation>
	);
}
