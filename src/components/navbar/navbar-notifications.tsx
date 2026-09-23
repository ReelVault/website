import { Link, useNavigate } from "@tanstack/react-router";
import { cn } from "cn";
import { ArrowRight, Bell, BellOff, Check, CheckCheck } from "lucide-react";
import { startTransition, useState } from "react";
import { useNotifications, useUnreadNotificationCount } from "@/client/hooks/use-notifications";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia } from "@/components/ui/empty";
import { SkeletonList } from "@/components/ui/skeleton";
import { m } from "@/paraglide/messages";
import { formatTimeAgo } from "@/utils/format-utils";
import { getNotificationColor, getNotificationIcon, getNotificationText } from "@/utils/notification-utils";

export function NavbarNotifications() {
	const [open, setOpen] = useState(false);
	const navigate = useNavigate();
	const unreadNotifications = useUnreadNotificationCount();
	const unreadCount = unreadNotifications.data?.count ?? 0;
	const { notifications, isLoading, markRead, markAllRead, isMarkingRead, isMarkingAllRead } = useNotifications(false);

	const quickNotifications = notifications.slice(0, 5);

	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger
				render={
					<Button
						aria-label={unreadCount ? m.components_navbar_notifications_aria({ unreadCount }) : m.components_navbar_notifications()}
						variant="ghost"
						size="icon-lg"
						className="relative"
					>
						<Bell data-icon="inline-start" aria-hidden="true" />
						{unreadCount > 0 && <span className="absolute top-2 right-2 size-1.5 rounded-full bg-primary" />}
					</Button>
				}
			/>

			<DropdownMenuContent
				align="end"
				sideOffset={8}
				className="w-[min(24rem,calc(100vw-2rem))] rounded-2xl border-border bg-popover/95 p-0 shadow-2xl backdrop-blur-md"
			>
				{/* Header */}
				<div className="flex items-center justify-between border-border/40 border-b px-4 py-3">
					<div className="flex items-center gap-2">
						<span className="font-semibold text-foreground text-sm">{m.user_notifications_heading()}</span>
						{unreadCount > 0 && (
							<Badge variant="secondary" size="sm" className="h-5 px-1.5 font-semibold text-[11px]">
								{unreadCount}
							</Badge>
						)}
					</div>
					{unreadCount > 0 && (
						<Button
							type="button"
							variant="ghost"
							size="xs"
							disabled={isMarkingAllRead}
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								startTransition(async () => {
									await markAllRead();
								});
							}}
							className="h-7 gap-1 text-muted-foreground text-xs hover:text-foreground"
							title={m.components_navbar_clear_notifications()}
						>
							<CheckCheck className="size-3.5" aria-hidden="true" />
							<span>{m.components_navbar_clear_word()}</span>
						</Button>
					)}
				</div>

				{/* Items List */}
				<div className="max-h-88 divide-y divide-border/20 overflow-y-auto">
					{isLoading && (
						<div className="flex flex-col gap-2 p-3">
							<SkeletonList count={3} itemClassName="h-14" />
						</div>
					)}

					{!isLoading && quickNotifications.length === 0 && (
						<Empty className="py-8">
							<EmptyHeader>
								<EmptyMedia variant="icon">
									<BellOff aria-hidden="true" />
								</EmptyMedia>
								<EmptyDescription className="text-xs">{m.components_navbar_no_notifications()}</EmptyDescription>
							</EmptyHeader>
						</Empty>
					)}

					{!isLoading &&
						quickNotifications.map((notification) => {
							const isRead = Boolean(notification.readAt);
							const { title, body } = getNotificationText(notification);
							const Icon = getNotificationIcon(notification.type);
							const colorClass = getNotificationColor(notification.type);
							const timeAgo = formatTimeAgo(notification.createdAt);

							return (
								<DropdownMenuItem
									key={notification.id}
									closeOnClick={Boolean(notification.link)}
									onClick={() => {
										startTransition(async () => {
											if (!isRead) {
												await markRead(notification.id);
											}

											if (notification.link) {
												setOpen(false);
												await navigate({ to: notification.link });
											}
										});
									}}
									className={cn(
										"group flex items-start gap-3 rounded-none border-border/10 border-b p-3 text-left transition-colors last:border-b-0 hover:cursor-pointer focus:bg-muted/70",
										isRead ? "text-muted-foreground hover:bg-muted/40" : "bg-primary/4 text-foreground hover:bg-primary/8",
									)}
								>
									<div className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-sm", colorClass)}>
										<Icon className="size-4" aria-hidden="true" />
									</div>

									<div className="min-w-0 flex-1">
										<div className="flex items-center justify-between gap-1">
											<span className={cn("truncate font-semibold text-xs", isRead ? "text-muted-foreground" : "text-foreground")}>
												{title}
											</span>
											<span className="shrink-0 text-[10px] text-muted-foreground">{timeAgo}</span>
										</div>
										{body && <p className="mt-0.5 line-clamp-2 text-muted-foreground text-xs leading-relaxed">{body}</p>}
									</div>

									{!isRead && (
										<Button
											type="button"
											variant="ghost"
											size="icon-xs"
											className="mt-0.5 shrink-0 text-muted-foreground hover:bg-primary/10 hover:text-primary"
											title={m.components_navbar_mark_read()}
											aria-label={m.components_navbar_mark_read()}
											disabled={isMarkingRead}
											onClick={(e) => {
												e.stopPropagation();
												e.preventDefault();
												startTransition(async () => {
													await markRead(notification.id);
												});
											}}
										>
											<Check className="size-3.5" aria-hidden="true" />
										</Button>
									)}
								</DropdownMenuItem>
							);
						})}
				</div>

				{/* Footer */}
				<div className="border-border/40 border-t p-2">
					<Button
						variant="ghost"
						size="sm"
						nativeButton={false}
						render={<Link to="/notifications" onClick={() => setOpen(false)} />}
						className="w-full justify-center gap-1 text-primary text-xs hover:bg-primary/10 hover:text-primary"
					>
						<span>{m.components_navbar_view_all_notifications()}</span>
						<ArrowRight className="size-3.5" aria-hidden="true" />
					</Button>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
