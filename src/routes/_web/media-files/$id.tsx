import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const MediaFilesPage = lazyRouteComponent(() => import("@/pages/web/media-files/media-files-page"));

// zod-free validateSearch — see src/types/search-params.ts for the rationale.
// `episode` narrows the page to one episode's files; `label` is the episode heading shown on the details page.
interface MediaFilesSearch {
	episode?: string;
	label?: string;
}

function mediaFilesSearchValidator(search: Record<string, unknown>): MediaFilesSearch {
	return {
		episode: typeof search.episode === "string" ? search.episode : undefined,
		label: typeof search.label === "string" ? search.label : undefined,
	};
}

export const Route = createFileRoute("/_web/media-files/$id")({
	component: MediaFilesPage,
	validateSearch: mediaFilesSearchValidator,
});
