import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminSettingsPage = lazyRouteComponent(() => import("@/pages/admin/settings/settings-page"));

export const Route = createFileRoute("/admin/settings")({
	component: AdminSettingsPage,
});
