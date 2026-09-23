import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminPluginDetailPage = lazyRouteComponent(() => import("@/pages/admin/plugins/by-id/plugins-by-id-page"));

export const Route = createFileRoute("/admin/plugins/$id")({
	component: AdminPluginDetailPage,
});
