import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminUpdatesPage = lazyRouteComponent(() => import("@/pages/admin/updates/updates-page"));

export const Route = createFileRoute("/admin/updates")({
	component: AdminUpdatesPage,
});
