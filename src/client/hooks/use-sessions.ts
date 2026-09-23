import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "../../utils/toast-utils";
import { reelvault } from "../client";
import { authKeys } from "../utils/query-keys";

export const sessionsQueryOptions = () =>
	queryOptions({
		queryKey: authKeys.sessions(),
		queryFn: () => reelvault.auth.listSessions(),
		staleTime: 60_000,
	});

export function useSessions() {
	const queryClient = useQueryClient();
	const sessionsQuery = useQuery(sessionsQueryOptions());
	const invalidate = () => queryClient.invalidateQueries({ queryKey: authKeys.sessions() });
	const revokeMutation = useMutation({
		mutationFn: (id: string) => reelvault.auth.revokeSession(id),
		onError: (error) => {
			toastError(m.toast_device_logout_failed(), error, m.toast_plugins_unexpected_error());
		},
		onSuccess: async () => {
			await invalidate();
			toast.success(m.toast_device_logged_out());
		},
	});
	const revokeOthersMutation = useMutation({
		mutationFn: () => reelvault.auth.revokeOtherSessions(),
		onError: (error) => {
			toastError(m.user_logout_rest_failed(), error, m.toast_plugins_unexpected_error());
		},
		onSuccess: async () => {
			await invalidate();
			toast.success(m.toast_other_devices_logged_out());
		},
	});

	return {
		sessionsQuery,
		sessions: sessionsQuery.data,
		refetch: sessionsQuery.refetch,
		revokeSessionAsync: revokeMutation.mutateAsync,
		revokeOtherSessionsAsync: revokeOthersMutation.mutateAsync,
		isRevoking: revokeMutation.isPending,
		isRevokingOthers: revokeOthersMutation.isPending,
	};
}
