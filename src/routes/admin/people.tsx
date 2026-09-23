import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminPeoplePage = lazyRouteComponent(() => import("@/pages/admin/people/people-page"));

export const Route = createFileRoute("/admin/people")({
	component: AdminPeoplePage,
});
