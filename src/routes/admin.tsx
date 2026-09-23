import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import { lazyRouteComponent } from "@/lib/lazy-route-component";
import { ensureAuthenticated } from "./-auth-guard";

const AdminLayout = lazyRouteComponent(() => import("@/pages/admin/admin-layout"));

export const Route = createFileRoute("/admin")({
	// Resolve auth/profile before rendering so admin deep links redirect like the
	// other guarded layouts instead of flashing a loading screen.
	beforeLoad: ({ context }) => ensureAuthenticated(context),
	component: Layout,
});

function Layout() {
	return (
		<Suspense fallback={null}>
			<AdminLayout>
				<Outlet />
			</AdminLayout>
		</Suspense>
	);
}
