import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminCollectionsPage = lazyRouteComponent(() => import("@/pages/admin/collections/collections-page"));

export const Route = createFileRoute("/admin/collections/")({
	component: AdminCollectionsPage,
});
