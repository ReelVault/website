import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import { lazyRouteComponent } from "@/lib/lazy-route-component";
import { useSpatialNavigation } from "@/lib/use-spatial-navigation";
import { ensureAuthenticated } from "./-auth-guard";

const UserLayout = lazyRouteComponent(() => import("@/pages/user/user-layout"));

export const Route = createFileRoute("/_user")({
	beforeLoad: ({ context }) => ensureAuthenticated(context),
	component: Layout,
});

function Layout() {
	// TV: the account page is remote-controlled too (D-pad).
	useSpatialNavigation();

	return (
		<Suspense fallback={null}>
			<UserLayout>
				<Outlet />
			</UserLayout>
		</Suspense>
	);
}
