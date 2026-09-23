import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminLibrariesPage = lazyRouteComponent(() => import("@/pages/admin/libraries/libraries-page"));

export const Route = createFileRoute("/admin/libraries")({
	component: AdminLibrariesPage,
});
