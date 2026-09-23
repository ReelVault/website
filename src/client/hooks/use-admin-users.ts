import type { AdminCreateUser } from "@reelvault/sdk";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { toastError } from "../../utils/toast-utils";
import { reelvault } from "../client";
import { adminKeys } from "../utils/query-keys";
import { useAdminDeleteUser } from "./use-admin-user";

const ADMIN_USERS_PAGE_SIZE = 25;

export const adminUsersQueryOptions = (search: string, page = 1, limit = ADMIN_USERS_PAGE_SIZE) => ({
	queryKey: adminKeys.users(search, { page, limit }),
	placeholderData: keepPreviousData,
	queryFn: () => reelvault.admin.getUsers({ search: search || undefined, page, limit }),
	staleTime: 120_000,
});

export function useAdminUsers(search: string, page = 1, limit = ADMIN_USERS_PAGE_SIZE) {
	const queryClient = useQueryClient();
	const usersQuery = useQuery(adminUsersQueryOptions(search, page, limit));
	const invalidateUsers = () => queryClient.invalidateQueries({ queryKey: adminKeys.usersAll() });

	const createMutation = useMutation({
		mutationFn: (body: AdminCreateUser) => reelvault.admin.createUser(body),
		onSuccess: invalidateUsers,
		onError: (err) => toastError(m.toast_user_create_failed(), err),
	});
	const updateMutation = useMutation({
		mutationFn: ({ id, body }: { id: string; body: { role?: "admin" | "user"; banned?: boolean; banReason?: string | null } }) =>
			reelvault.admin.updateUser(id, body),
		onSuccess: invalidateUsers,
		onError: (err) => toastError(m.toast_user_update_failed(), err),
	});
	const deleteUserMutation = useAdminDeleteUser();

	return {
		users: usersQuery.data?.data ?? [],
		total: usersQuery.data?.pagination.total ?? 0,
		totalPages: usersQuery.data?.pagination.totalPages ?? 1,
		page: usersQuery.data?.pagination.page ?? page,
		isLoading: usersQuery.isLoading,
		error: usersQuery.error,
		refetch: usersQuery.refetch,
		createUser: createMutation.mutateAsync,
		isCreating: createMutation.isPending,
		updateUser: (id: string, body: { role?: "admin" | "user"; banned?: boolean; banReason?: string | null }) =>
			updateMutation.mutateAsync({ id, body }),
		deleteUser: deleteUserMutation.mutateAsync,
		updatingId: updateMutation.isPending ? updateMutation.variables.id : undefined,
	};
}

export function useAdminUserFull(userId?: string) {
	return useQuery({
		queryKey: adminKeys.userFull(userId),
		queryFn: () => (userId ? reelvault.admin.getUserFull(userId) : Promise.reject(new Error("userId is required"))),
		enabled: Boolean(userId),
		staleTime: 60_000,
	});
}
