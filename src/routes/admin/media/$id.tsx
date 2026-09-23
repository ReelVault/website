import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminMediaFileDetailPage = lazyRouteComponent(() => import("@/pages/admin/media/$id/page"));

export const Route = createFileRoute("/admin/media/$id")({
	component: AdminMediaFileDetailPage,
});
