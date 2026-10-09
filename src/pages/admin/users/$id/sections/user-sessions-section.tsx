import { LogOut } from "lucide-react";
import { useRevokeUserSession, useRevokeUsersSessions, useUserSessions } from "@/client/hooks/use-admin-user-sessions";
import { ConfirmAction } from "@/components/confirm-action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { formatDate, formatTimeAgo } from "@/utils/format-utils";

/** The account's signed-in sessions, with sign-out for each one and for all of them. */
export function UserSessionsSection({ userId }: { userId: string }) {
	const sessionsQuery = useUserSessions(userId);
	const revokeSession = useRevokeUserSession(userId);
	const revokeAll = useRevokeUsersSessions();
	const sessions = sessionsQuery.data?.data ?? [];

	return (
		<Card>
			<CardHeader>
				<CardTitle>{m.admin_users_sessions_title()}</CardTitle>
				<CardDescription>{m.admin_users_sessions_description()}</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				{sessions.length === 0 ? (
					<p className="text-muted-foreground text-sm">{m.admin_users_sessions_empty()}</p>
				) : (
					sessions.map((session) => (
						<div key={session.id} className="flex items-center justify-between gap-3 rounded-md border border-border p-3 text-sm">
							<div className="min-w-0">
								<p className="truncate">{session.userAgent ?? m.admin_users_session_unknown_device()}</p>
								<p className="text-muted-foreground text-xs">
									{m.admin_users_session_meta({
										ip: session.ipAddress ?? "—",
										lastUsed: formatTimeAgo(session.updatedAt),
										started: formatDate(session.createdAt),
									})}
								</p>
							</div>
							<ConfirmAction
								trigger={
									<Button variant="outline" size="sm" disabled={revokeSession.isPending}>
										<LogOut className="size-3.5" />
										{m.admin_users_session_end()}
									</Button>
								}
								title={m.admin_users_session_end_title()}
								description={m.admin_users_session_end_description()}
								confirmLabel={m.admin_users_session_end()}
								onConfirm={() => detach(revokeSession.mutateAsync(session.id))}
							/>
						</div>
					))
				)}
				{sessions.length > 0 && (
					<div className="flex justify-end">
						<ConfirmAction
							trigger={
								<Button variant="destructive" size="sm" disabled={revokeAll.isPending}>
									{m.admin_users_sign_out_everywhere()}
								</Button>
							}
							title={m.admin_users_sign_out_everywhere_title()}
							description={m.admin_users_sign_out_everywhere_description()}
							confirmLabel={m.admin_users_sign_out_everywhere()}
							onConfirm={() => detach(revokeAll.mutateAsync([userId]))}
						/>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
