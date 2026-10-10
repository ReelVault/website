import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const LibraryEditPage = lazyRouteComponent(() => import("@/pages/admin/libraries/library-edit-page"));

export const Route = createFileRoute("/admin/libraries/$id/")({
	component: LibraryEditPage,
});
