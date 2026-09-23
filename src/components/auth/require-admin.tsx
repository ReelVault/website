import { useNavigate } from "@tanstack/react-router";
import { type ReactNode, startTransition, useEffect } from "react";
import { useCurrentUser } from "@/client/hooks/use-current-profile";
import LoadingScreen from "@/components/loading-screen";
import { isAdminUser } from "./admin-access";

/** Client-side guard for the admin area. The API remains the source of authorization. */
export function RequireAdmin({ children }: { children: ReactNode }) {
	const navigate = useNavigate();
	const { user, isLoading } = useCurrentUser();
	const hasAdminAccess = isAdminUser(user);

	useEffect(() => {
		if (!(isLoading || hasAdminAccess)) startTransition(() => navigate({ to: "/dashboard", replace: true }));
	}, [hasAdminAccess, isLoading, navigate]);

	if (isLoading || !hasAdminAccess) return <LoadingScreen />;

	return <>{children}</>;
}
