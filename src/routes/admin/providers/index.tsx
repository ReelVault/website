import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminProvidersPage = lazyRouteComponent(() => import("@/pages/admin/providers/providers-page"));

export const Route = createFileRoute("/admin/providers/")({
	component: AdminProvidersPage,
});
