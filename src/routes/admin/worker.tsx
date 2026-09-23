import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminWorkerPage = lazyRouteComponent(() => import("@/pages/admin/worker/worker-page"));

export const Route = createFileRoute("/admin/worker")({
	component: AdminWorkerPage,
});
