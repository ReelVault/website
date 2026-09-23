import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminLogsPage = lazyRouteComponent(() => import("@/pages/admin/logs/logs-page"));

export const Route = createFileRoute("/admin/logs")({
	component: AdminLogsPage,
});
