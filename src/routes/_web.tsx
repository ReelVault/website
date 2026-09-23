import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import { lazyRouteComponent } from "@/lib/lazy-route-component";
import { useSpatialNavigation } from "@/lib/use-spatial-navigation";
import { ensureAuthenticated } from "./-auth-guard";

const WebLayout = lazyRouteComponent(() => import("@/pages/web/web-layout"));

export const Route = createFileRoute("/_web")({
	beforeLoad: ({ context }) => ensureAuthenticated(context),
	component: Layout,
});

function Layout() {
	// D-pad / arrow keys move focus across web views (TV mode). The player has
	// its own arrow-key shortcuts, hence initialization only in the _web layout.
	useSpatialNavigation();

	return (
		<Suspense fallback={null}>
			<WebLayout>
				<Outlet />
			</WebLayout>
		</Suspense>
	);
}
