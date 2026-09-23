import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminTrickplayPage = lazyRouteComponent(() => import("@/pages/admin/trickplay/trickplay-page"));

export const Route = createFileRoute("/admin/trickplay")({
	component: AdminTrickplayPage,
});
