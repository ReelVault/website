import type { ChangePasswordRequest } from "@reelvault/sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reelvault } from "../client";
import { authKeys } from "../utils/query-keys";

export function useChangePassword() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (body: ChangePasswordRequest) => reelvault.auth.changePassword(body),
		// The server rotates the session token (other sessions are revoked), so refresh the session state.
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: authKeys.me() });
		},
	});
}
