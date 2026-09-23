import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminSubtitlesPage = lazyRouteComponent(() => import("@/pages/admin/subtitles/subtitles-page"));

export const Route = createFileRoute("/admin/subtitles")({
	component: AdminSubtitlesPage,
});
