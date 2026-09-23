import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminKeywordsPage = lazyRouteComponent(() => import("@/pages/admin/keywords/keywords-page"));

export const Route = createFileRoute("/admin/keywords")({
	component: AdminKeywordsPage,
});
