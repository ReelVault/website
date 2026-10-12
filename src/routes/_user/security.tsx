import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const SecurityPage = lazyRouteComponent(() => import("@/pages/user/security/security-page"));

export const Route = createFileRoute("/_user/security")({
	component: SecurityPage,
});
