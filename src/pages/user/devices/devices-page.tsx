import { LogOut } from "lucide-react";
import { useSessions } from "@/client/hooks/use-sessions";
import { AppEmptyState, AppErrorState } from "@/components/app-states";
import { ConfirmAction } from "@/components/confirm-action";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { toastError } from "@/utils/toast-utils";
import { UserPageHeader, UserSectionTitle } from "../components/user-ui";
import { DeviceSessionCard } from "./components/device-session-card";

const SKELETON_KEYS = ["1", "2", "3"] as const;

export default function DevicesPage() {
	const { sessionsQuery, sessions, revokeSessionAsync, revokeOtherSessionsAsync, isRevoking, isRevokingOthers } = useSessions();
	const sessionItems = sessions?.data ?? [];

	const handleRevokeOthers = async () => {
		if (isRevokingOthers) return;

		try {
			await revokeOtherSessionsAsync();
		} catch (error) {
			toastError(m.user_logout_rest_failed(), error);
		}
	};

	const handleRevokeSession = async (id: string) => {
		if (isRevoking) return;

		try {
			await revokeSessionAsync(id);
		} catch (error) {
			toastError(m.user_session_terminate_failed(), error);
		}
	};

	return (
		<main className="flex flex-col gap-10 pb-10">
			<UserPageHeader
				eyebrow={m.user_security()}
				title={m.auth_devices()}
				description={m.user_manage_sessions_description()}
				action={
					(sessions?.total ?? 0) > 1 && (
						<ConfirmAction
							trigger={
								<Button variant="outline" className="min-h-11 gap-2" disabled={isRevokingOthers}>
									<LogOut className="size-4" aria-hidden="true" /> {m.user_log_out_rest()}
								</Button>
							}
							title={m.user_logout_remaining_confirm()}
							description={m.user_other_sessions_terminated_notice()}
							confirmLabel={m.user_log_out_rest()}
							onConfirm={handleRevokeOthers}
							onError={(error) => toastError(m.user_logout_rest_failed(), error)}
						/>
					)
				}
			/>

			{(() => {
				if (sessionsQuery.isLoading) {
					return (
						<div className="flex flex-col gap-4" aria-busy="true">
							{SKELETON_KEYS.map((key) => (
								<Skeleton key={key} className="h-28 rounded-2xl" />
							))}
						</div>
					);
				}

				if (sessionsQuery.isError) {
					return (
						<AppErrorState
							title={m.user_active_sessions_fetch_failed()}
							error={sessionsQuery.error}
							onRetry={() => detach(sessionsQuery.refetch())}
						/>
					);
				}

				return (
					sessions?.total === 0 && (
						<AppEmptyState title={m.user_devices_sessions_empty()} description={m.user_devices_sessions_empty_desc()} />
					)
				);
			})()}

			<section>
				<UserSectionTitle title={m.user_active_sessions()} description={m.user_sessions_auto_refresh()} />
				<div className="flex flex-col gap-3">
					{!(sessionsQuery.isLoading || sessionsQuery.isError) &&
						sessionItems.map((session, index) => (
							<DeviceSessionCard key={session.id} session={session} index={index} isRevoking={isRevoking} onRevoke={handleRevokeSession} />
						))}
				</div>
			</section>
		</main>
	);
}
