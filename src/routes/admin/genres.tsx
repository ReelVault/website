import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminGenresPage = lazyRouteComponent(() => import("@/pages/admin/genres/genres-page"));

export const Route = createFileRoute("/admin/genres")({
	component: AdminGenresPage,
});
