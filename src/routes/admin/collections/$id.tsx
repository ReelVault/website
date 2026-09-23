import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminCollectionDetailPage = lazyRouteComponent(() => import("@/pages/admin/collections/$id/page"));

export const Route = createFileRoute("/admin/collections/$id")({
	component: AdminCollectionDetailPage,
});
