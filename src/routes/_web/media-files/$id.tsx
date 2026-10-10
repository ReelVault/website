import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const MediaFilesPage = lazyRouteComponent(() => import("@/pages/web/media-files/media-files-page"));

export const Route = createFileRoute("/_web/media-files/$id")({
	component: MediaFilesPage,
});
