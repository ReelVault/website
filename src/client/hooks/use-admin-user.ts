import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "../../utils/toast-utils";
import { reelvault } from "../client";
import { adminKeys } from "../utils/query-keys";

export function useAdminUser(userId: string) {
	const queryClient = useQueryClient();
	const query = useQuery({
		queryKey: adminKeys.user(userId),
		enabled: Boolean(userId),
		queryFn: () => reelvault.admin.getUser(userId),
		staleTime: 300_000,
	});
	const updateMutation = useMutation({
		mutationFn: ({ id, body }: { id: string; body: { role?: "admin" | "user"; banned?: boolean; banReason?: string | null } }) =>
			reelvault.admin.updateUser(id, body),
		onSuccess: async (user) => {
			queryClient.setQueryData(adminKeys.user(userId), user);
			await queryClient.invalidateQueries({ queryKey: adminKeys.usersAll() });
		},
		onError: (err) => toastError(m.toast_user_update_failed(), err),
	});

	return {
		user: query.data,
		isLoading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
		updateUser: (body: { role?: "admin" | "user"; banned?: boolean; banReason?: string | null }) =>
			updateMutation.mutateAsync({ id: userId, body }),
		isUpdating: updateMutation.isPending,
	};
}

export function useAdminDeleteUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => reelvault.admin.deleteUser(id),
		onSuccess: async (_, id) => {
			await queryClient.invalidateQueries({ queryKey: adminKeys.usersAll() });
			queryClient.removeQueries({ queryKey: adminKeys.user(id) });
			queryClient.removeQueries({ queryKey: adminKeys.userFull(id) });
			toast.success(m.toast_account_deleted());
		},
		onError: (err) => toastError(m.admin_users_failed_to_delete(), err),
	});
}
