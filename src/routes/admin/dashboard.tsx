import { createFileRoute } from "@tanstack/react-router";
import { adminStatsQueryOptions } from "@/client/hooks/use-admin-stats";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminDashboardPage = lazyRouteComponent(() => import("@/pages/admin/dashboard/dashboard-page"));

export const Route = createFileRoute("/admin/dashboard")({
	loader: ({ context: { queryClient } }) => {
		detach(queryClient.query(adminStatsQueryOptions()));
	},
	component: AdminDashboardPage,
});
