import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminCompaniesPage = lazyRouteComponent(() => import("@/pages/admin/companies/companies-page"));

export const Route = createFileRoute("/admin/companies")({
	component: AdminCompaniesPage,
});
