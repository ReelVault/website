import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminUserDetailPage = lazyRouteComponent(() => import("@/pages/admin/users/$id/page"));

export const Route = createFileRoute("/admin/users/$id")({
	component: AdminUserDetailPage,
});
