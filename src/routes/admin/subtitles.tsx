import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminSubtitlesPage = lazyRouteComponent(() => import("@/pages/admin/subtitles/subtitles-page"));

// zod-free validateSearch — see src/routes/admin/media/index.tsx.
interface AdminSubtitlesSearch {
	page?: number;
	type?: "embedded" | "external";
	language?: string;
	q?: string;
}

const SUBTITLE_TYPES: ReadonlyArray<"embedded" | "external"> = ["embedded", "external"];

function adminSubtitlesSearchValidator(search: Record<string, unknown>): AdminSubtitlesSearch {
	const rawPage = Number(search.page);

	return {
		page: Number.isInteger(rawPage) && rawPage > 1 ? rawPage : undefined,
		type: SUBTITLE_TYPES.find((candidate) => candidate === search.type),
		language: typeof search.language === "string" && search.language !== "" ? search.language : undefined,
		q: typeof search.q === "string" && search.q !== "" ? search.q : undefined,
	};
}

export const Route = createFileRoute("/admin/subtitles")({
	validateSearch: adminSubtitlesSearchValidator,
	component: AdminSubtitlesPage,
});
