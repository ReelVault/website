import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminDatabasePage = lazyRouteComponent(() => import("@/pages/admin/database/database-page"));

export const Route = createFileRoute("/admin/database")({
	component: AdminDatabasePage,
});
