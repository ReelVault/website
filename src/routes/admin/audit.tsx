import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminAuditPage = lazyRouteComponent(() => import("@/pages/admin/audit/audit-page"));

export const Route = createFileRoute("/admin/audit")({
	component: AdminAuditPage,
});
