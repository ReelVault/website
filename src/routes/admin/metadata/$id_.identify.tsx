import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminMetadataIdentifyPage = lazyRouteComponent(() => import("@/pages/admin/metadata/$id/identify-page"));

export const Route = createFileRoute("/admin/metadata/$id_/identify")({
	component: AdminMetadataIdentifyPage,
});
