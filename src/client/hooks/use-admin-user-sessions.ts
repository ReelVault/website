import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "@/utils/toast-utils";
import { reelvault } from "../client";
import { adminKeys } from "../utils/query-keys";

/** The user's sessions that have not expired: device, address and times. */
export function useUserSessions(userId: string) {
	return useQuery({
		queryKey: adminKeys.userSessions(userId),
		queryFn: () => reelvault.admin.getUserSessions(userId, { limit: 50 }),
		placeholderData: keepPreviousData,
	});
}

/** Ends one session of the user; the user's session list and the user list refresh afterwards. */
export function useRevokeUserSession(userId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (sessionId: string) => reelvault.admin.revokeUserSession(userId, sessionId),
		onSuccess: async () => {
			toast.success(m.admin_users_session_revoked());
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: adminKeys.userSessions(userId) }),
				queryClient.invalidateQueries({ queryKey: adminKeys.usersAll() }),
			]);
		},
		onError: (error) => {
			toastError(m.admin_users_sessions_revoke_failed(), error);
		},
	});
}

/** Ends every session of the listed users at once; their session lists and the user list refresh afterwards. */
export function useRevokeUsersSessions() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (userIds: string[]) => reelvault.admin.revokeUsersSessions({ userIds }),
		onSuccess: async ({ revokedSessions }, userIds) => {
			toast.success(m.admin_users_sessions_revoked({ count: revokedSessions }));
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: adminKeys.usersAll() }),
				...userIds.map((userId) => queryClient.invalidateQueries({ queryKey: adminKeys.userSessions(userId) })),
			]);
		},
		onError: (error) => {
			toastError(m.admin_users_sessions_revoke_failed(), error);
		},
	});
}
