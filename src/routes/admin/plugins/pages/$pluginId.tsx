import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminPluginCustomPage = lazyRouteComponent(() => import("@/pages/admin/plugins/$pluginId/page"));

export const Route = createFileRoute("/admin/plugins/pages/$pluginId")({
	component: AdminPluginCustomPage,
});
