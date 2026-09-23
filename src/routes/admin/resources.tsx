import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminResourcesPage = lazyRouteComponent(() => import("@/pages/admin/resources/resources-page"));

export const Route = createFileRoute("/admin/resources")({
	component: AdminResourcesPage,
});
