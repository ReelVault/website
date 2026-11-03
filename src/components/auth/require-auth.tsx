import { ReelVaultError } from "@reelvault/sdk/client";
import { useNavigate } from "@tanstack/react-router";
import { type ReactNode, startTransition, useEffect } from "react";
import { useCurrentUser } from "@/client/hooks/use-current-profile";
import { AppErrorState } from "@/components/app-states";
import { LoadingScreen } from "@/components/loading-screen";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";

export function RequireAuth({ children, requireProfile }: { children: ReactNode; requireProfile?: boolean }) {
	const navigate = useNavigate();
	const { user, profile, isLoading, isFetching, isError, error, refetch } = useCurrentUser();
	const isAuthorized = Boolean(user && (!requireProfile || profile));
	const isAuthRejection = error instanceof ReelVaultError && (error.status === 401 || error.status === 403);

	useEffect(() => {
		if (isLoading || (!isAuthorized && isFetching)) return;

		// A network/5xx failure is not a sign-out. Keep the user on the page and
		// let them retry instead of bouncing to /auth/login. A 401/403 still
		// redirects below.
		if (isError && !user && !isAuthRejection) return;

		if (!user) {
			// Transition consumes the navigation promise without leaving it floating.
			startTransition(() => navigate({ to: "/auth/login", replace: true }));
		} else if (requireProfile && !profile) {
			startTransition(() => navigate({ to: "/auth/profiles", replace: true }));
		}
	}, [user, profile, isLoading, isFetching, requireProfile, navigate, isAuthorized, isError, isAuthRejection]);

	if (isError && !user && !isAuthRejection) {
		return (
			<div className="bg-background flex min-h-svh items-center justify-center p-6">
				<AppErrorState
					title={m.common_network_error()}
					description={m.user_check_server_connection()}
					error={error}
					onRetry={() => detach(refetch)}
				/>
			</div>
		);
	}

	if (isLoading || (!isAuthorized && isFetching) || !isAuthorized) {
		return <LoadingScreen />;
	}

	return <>{children}</>;
}
