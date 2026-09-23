import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminMetadataDetailPage = lazyRouteComponent(() => import("@/pages/admin/metadata/$id/page"));

export const Route = createFileRoute("/admin/metadata/$id")({
	component: AdminMetadataDetailPage,
});
