import { createFileRoute, redirect } from "@tanstack/react-router";
import { librariesQueryOptions } from "@/client/hooks/use-libraries";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const SeriesPage = lazyRouteComponent(() => import("@/pages/web/_libraries/series/series-page"));

/**
 * Library filter params owned by use-library-logic; absent keys mean "default".
 * Declared so the router types search updates from the filters hook.
 */
const validateSearch = (search: Record<string, unknown>) => ({
	...(typeof search.q === "string" && { q: search.q }),
	...(typeof search.sortBy === "string" && { sortBy: search.sortBy }),
	...(typeof search.sortOrder === "string" && { sortOrder: search.sortOrder }),
	...(typeof search.yearFrom === "string" && { yearFrom: search.yearFrom }),
	...(typeof search.yearTo === "string" && { yearTo: search.yearTo }),
	...(typeof search.genres === "string" && { genres: search.genres }),
	...(typeof search.durationMin === "string" && { durationMin: search.durationMin }),
	...(typeof search.durationMax === "string" && { durationMax: search.durationMax }),
	...(typeof search.watched === "string" && { watched: search.watched }),
	...(typeof search.rating === "string" && { rating: search.rating }),
	...(typeof search.genreMode === "string" && { genreMode: search.genreMode }),
	...(typeof search.genreIndex === "string" && { genreIndex: search.genreIndex }),
});

export const Route = createFileRoute("/_web/series/")({
	validateSearch,
	beforeLoad: async ({ context: { queryClient } }) => {
		const res = await queryClient.query({ ...librariesQueryOptions("tv_shows"), staleTime: "static" });
		const first = res.data[0];
		if (first?.id) {
			redirect({ to: "/series/$id", params: { id: first.id }, throw: true });
		}
	},
	component: SeriesPage,
});
