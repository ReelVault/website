import { Clock, Copy, Globe, Laptop, LogOut, Smartphone } from "lucide-react";
import type { useSessions } from "@/client/hooks/use-sessions";
import { ConfirmAction } from "@/components/confirm-action";
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
import { toastError } from "@/utils/toast-utils";

type SessionItem = NonNullable<ReturnType<typeof useSessions>["sessions"]>["data"][number];

// copyToClipboard reports clipboard failures through its own toasts and never
// rejects; a revoked session request reports failure through the toast below.
async function revokeSession(revoke: (id: string) => Promise<void> | void, id: string): Promise<void> {
	try {
		await revoke(id);
	} catch (error) {
		toastError(m.user_session_terminate_failed(), error);
	}
}

interface DeviceSessionCardProps {
	session: SessionItem;
	index: number;
	isRevoking: boolean;
	onRevoke: (id: string) => Promise<void> | void;
}

export function DeviceSessionCard({ session, index, isRevoking, onRevoke }: DeviceSessionCardProps) {
	const isMobile = session.userAgent?.toLowerCase().includes("mobile");
	const deviceTitle = session.userAgent ?? m.user_unknown_device();

	return (
		<SimpleAnimation direction="up" delay={Math.min(index * 35, 240)} duration={240}>
			<ContextMenu>
				<ContextMenuTrigger className="flex flex-col gap-5 rounded-2xl border border-border/70 bg-card/70 p-5 transition-[border-color,background-color] hover:border-primary/40 hover:bg-card sm:flex-row sm:items-center sm:justify-between">
					<div className="flex min-w-0 items-center gap-4">
						<div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
							{isMobile ? <Smartphone className="size-5" aria-hidden="true" /> : <Laptop className="size-5" aria-hidden="true" />}
						</div>
						<div className="min-w-0">
							<div className="flex items-center gap-3">
								<h2 className="truncate font-bold">{deviceTitle}</h2>
								{session.isCurrent && (
									<span className="rounded-full bg-primary/10 px-2 py-1 font-bold text-[9px] text-primary uppercase">
										{m.user_this_device()}
									</span>
								)}
							</div>
							<p className="mt-1 flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
								<Clock className="size-3.5" aria-hidden="true" />{" "}
								{m.user_devices_last_activity({ time: formatDateTime(session.updatedAt) })}
								{session.ipAddress ? ` · ${session.ipAddress}` : ""}
							</p>
						</div>
					</div>
					{!session.isCurrent && (
						<ConfirmAction
							trigger={
								<Button
									variant="ghost"
									className="min-h-11 text-destructive hover:bg-destructive/10 hover:text-destructive"
									disabled={isRevoking}
								>
									{m.auth_logout()}
								</Button>
							}
							title={m.user_log_out_device()}
							description={m.user_terminate_session_immediately()}
							confirmLabel={m.auth_logout()}
							onConfirm={() => onRevoke(session.id)}
							onError={(error) => toastError(m.user_session_terminate_failed(), error)}
						/>
					)}
				</ContextMenuTrigger>

				<ContextMenuContent className="w-64 border-border bg-popover shadow-xl">
					<ContextMenuGroup>
						<ContextMenuLabel className="truncate font-bold text-foreground text-xs uppercase tracking-wider">
							{m.user_session_options()}
						</ContextMenuLabel>
						<ContextMenuSeparator />
						{session.ipAddress && (
							<ContextMenuItem
								onClick={() => {
									detach(copyToClipboard(session.ipAddress ?? "", m.common_ip_address_label()));
								}}
								className="cursor-pointer gap-2.5"
							>
								<Globe className="size-4 text-muted-foreground" />
								<span>{m.common_copy_ip()}</span>
							</ContextMenuItem>
						)}
						{session.userAgent && (
							<ContextMenuItem
								onClick={() => {
									detach(copyToClipboard(session.userAgent ?? "", m.common_user_agent_label()));
								}}
								className="cursor-pointer gap-2.5"
							>
								<Copy className="size-4 text-muted-foreground" />
								<span>{m.common_copy_user_agent()}</span>
							</ContextMenuItem>
						)}
						{!session.isCurrent && (
							<>
								<ContextMenuSeparator />
								<ContextMenuItem
									onClick={() => {
										detach(revokeSession(onRevoke, session.id));
									}}
									className="cursor-pointer gap-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive"
								>
									<LogOut className="size-4" />
									<span>{m.user_log_out_device()}</span>
								</ContextMenuItem>
							</>
						)}
					</ContextMenuGroup>
				</ContextMenuContent>
			</ContextMenu>
		</SimpleAnimation>
	);
}
