import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const SettingsPage = lazyRouteComponent(() => import("@/pages/user/settings/settings-page"));

export const Route = createFileRoute("/_user/settings")({
	component: SettingsPage,
});
