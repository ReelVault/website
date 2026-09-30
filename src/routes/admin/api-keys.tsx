import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminApiKeysPage = lazyRouteComponent(() => import("@/pages/admin/api-keys/api-keys-page"));

export const Route = createFileRoute("/admin/api-keys")({
	component: AdminApiKeysPage,
});
