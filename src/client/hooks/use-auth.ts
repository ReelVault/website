import { useMutation, useQueryClient } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { toastError } from "@/utils/toast-utils";
import { reelvault } from "../client";
import { authKeys } from "../utils/query-keys";
import { resetWatchlistBatch } from "./use-watchlist";

export function useLogin() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ email, password }: { email: string; password: string }) => reelvault.auth.login({ email, password }),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: authKeys.me() });
		},
	});
}

export function useVerifyTotp() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (code: string) => reelvault.auth.verifyTotp(code),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: authKeys.me() });
		},
	});
}

export function useVerifyBackupCode() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (code: string) => reelvault.auth.verifyBackupCode(code),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: authKeys.me() });
		},
	});
}

export function useRegister() {
	// react-doctor-disable-next-line react-doctor/query-mutation-missing-invalidation -- registration redirects to login/verify
	return useMutation({
		mutationFn: ({ username, email, password }: { username: string; email: string; password: string }) =>
			reelvault.auth.register({ username, email, password }),
	});
}

export function useLogout() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => reelvault.auth.logout(),
		onSuccess: () => {
			if (typeof document !== "undefined") {
				// react-doctor-disable-next-line react-doctor/insecure-session-cookie
				/* biome-ignore lint/suspicious/noDocumentCookie: sync cookie clearing has no platform alternative (cookieStore is async) */ document.cookie =
					"better-auth.session_token=; Max-Age=0; path=/;";
				// react-doctor-disable-next-line react-doctor/insecure-session-cookie
				/* biome-ignore lint/suspicious/noDocumentCookie: sync cookie clearing has no platform alternative (cookieStore is async) */ document.cookie =
					"__Secure-better-auth.session_token=; Max-Age=0; path=/;";
				// biome-ignore lint/suspicious/noDocumentCookie: sync cookie clearing has no platform alternative (cookieStore is async)
				document.cookie = "current_profile_id=; Max-Age=0; path=/;";
				// biome-ignore lint/suspicious/noDocumentCookie: sync cookie clearing has no platform alternative (cookieStore is async)
				document.cookie = "profile_unlock=; Max-Age=0; path=/;";
			}

			queryClient.clear();
			resetWatchlistBatch();
		},
		onError: (error) => {
			console.error("Failed to log out", error);
			toastError(m.components_navbar_logout_failed(), error);
		},
	});
}

export function useQuickConnectInitiate() {
	// react-doctor-disable-next-line react-doctor/query-mutation-missing-invalidation -- device pairing initiation
	return useMutation({
		mutationFn: () => reelvault.auth.quickConnectInitiate(),
	});
}

export function useQuickConnectAuthorize() {
	// react-doctor-disable-next-line react-doctor/query-mutation-missing-invalidation -- authorizes external device
	return useMutation({
		mutationFn: (code: string) => reelvault.auth.quickConnectAuthorize(code),
	});
}

export function useQuickConnectGenerate() {
	// react-doctor-disable-next-line react-doctor/query-mutation-missing-invalidation -- generates voucher code
	return useMutation({
		mutationFn: () => reelvault.auth.quickConnectGenerate(),
	});
}

export function useQuickConnectRedeem() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (code: string) => reelvault.auth.quickConnectRedeem(code),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: authKeys.me() });
		},
	});
}
