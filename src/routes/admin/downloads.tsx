import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminDownloadsPage = lazyRouteComponent(() => import("@/pages/admin/downloads/downloads-page"));

export const Route = createFileRoute("/admin/downloads")({
	component: AdminDownloadsPage,
});
