import { useNavigate } from "@tanstack/react-router";
import { type ReactNode, startTransition, useEffect } from "react";
import { useCurrentUser } from "@/client/hooks/use-current-profile";
import LoadingScreen from "@/components/loading-screen";

export function RequireAuth({ children, requireProfile }: { children: ReactNode; requireProfile?: boolean }) {
	const navigate = useNavigate();
	const { user, profile, isLoading, isFetching } = useCurrentUser();
	const isAuthorized = Boolean(user && (!requireProfile || profile));

	useEffect(() => {
		if (isLoading || (!isAuthorized && isFetching)) return;

		if (!user) {
			// Transition consumes the navigation promise without leaving it floating.
			startTransition(() => navigate({ to: "/auth/login", replace: true }));
		} else if (requireProfile && !profile) {
			startTransition(() => navigate({ to: "/auth/profiles", replace: true }));
		}
	}, [user, profile, isLoading, isFetching, requireProfile, navigate, isAuthorized]);

	if (isLoading || (!isAuthorized && isFetching) || !isAuthorized) {
		return <LoadingScreen />;
	}

	return <>{children}</>;
}
