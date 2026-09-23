import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reelvault } from "../client";
import { authKeys } from "../utils/query-keys";
import { useVerifyTotp } from "./use-auth";

export interface TwoFactorEnableResult {
	totpURI: string;
	backupCodes: string[];
}

export function useTwoFactor() {
	const queryClient = useQueryClient();

	// react-doctor-disable-next-line react-doctor/query-mutation-missing-invalidation -- returns temporary setup secret before verification
	const enableMutation = useMutation({
		mutationFn: async ({ password }: { password: string }): Promise<TwoFactorEnableResult> => {
			return await reelvault.auth.enableTwoFactor(password);
		},
	});

	const verifyTotp = useVerifyTotp();
	const verifyMutation = { ...verifyTotp, mutateAsync: ({ code }: { code: string }) => verifyTotp.mutateAsync(code) };

	const disableMutation = useMutation({
		mutationFn: async ({ password }: { password: string }) => {
			return await reelvault.auth.disableTwoFactor(password);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: authKeys.me() });
		},
	});

	// react-doctor-disable-next-line react-doctor/query-mutation-missing-invalidation -- returns generated backup codes to display
	const generateBackupCodesMutation = useMutation({
		mutationFn: async ({ password }: { password: string }): Promise<{ backupCodes: string[] }> => {
			return await reelvault.auth.generateBackupCodes(password);
		},
	});

	return {
		enableMutation,
		verifyMutation,
		disableMutation,
		generateBackupCodesMutation,
	};
}
