import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "@/utils/toast-utils";
import { reelvault } from "../client";
import { adminKeys } from "../utils/query-keys";

export function useAdminApiKeys() {
	const queryClient = useQueryClient();

	const apiKeysQuery = useQuery({
		queryKey: adminKeys.apiKeys(),
		queryFn: () => reelvault.admin.getApiKeys(),
		staleTime: 30_000,
	});

	const createMutation = useMutation({
		mutationFn: (input: { name: string; scope: "read_only" | "full"; expiresAtDays?: number }) => reelvault.admin.createApiKey(input),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: adminKeys.apiKeys() });
		},
		onError: (error) => toastError(m.admin_api_keys_failed_to_create(), error),
	});

	const revokeMutation = useMutation({
		mutationFn: (id: string) => reelvault.admin.revokeApiKey(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: adminKeys.apiKeys() });
			toast.success(m.admin_api_keys_revoked());
		},
		onError: (error) => toastError(m.admin_api_keys_failed_to_revoke(), error),
	});

	return { apiKeysQuery, createMutation, revokeMutation };
}
