import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const RemotePage = lazyRouteComponent(() => import("@/pages/user/remote/remote-page"));

export const Route = createFileRoute("/_user/remote")({
	component: RemotePage,
});
