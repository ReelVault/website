import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const PluginCatalogPage = lazyRouteComponent(() => import("@/pages/admin/plugins/catalog/plugin-catalog-page"));

export const Route = createFileRoute("/admin/plugins/catalog/$id")({
	component: PluginCatalogPage,
});
