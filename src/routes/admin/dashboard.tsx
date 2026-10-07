import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminDashboardPage = lazyRouteComponent(() => import("@/pages/admin/dashboard/dashboard-page"));

export const Route = createFileRoute("/admin/dashboard")({
	component: AdminDashboardPage,
});
