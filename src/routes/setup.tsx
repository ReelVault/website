import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const SetupPage = lazyRouteComponent(() => import("@/pages/setup/setup-page"));

export const Route = createFileRoute("/setup")({
	component: SetupPage,
});
