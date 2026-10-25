import { createFileRoute } from "@tanstack/react-router";
import { librariesQueryOptions, libraryDetailQueryOptions } from "@/client/library-queries";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const SeriesLibraryPage = lazyRouteComponent(() => import("@/pages/web/_libraries/series/series-by-id-page"));

export const Route = createFileRoute("/_web/series/$id")({
	loader: ({ context: { queryClient }, params: { id } }) => {
		// The grid options module comes with the page chunk; loading it here would
		// put it in the eager graph for a prefetch that is fire-and-forget anyway.
		detach(async () => {
			const { libraryMetadataInfiniteQueryOptions } = await import("@/client/hooks/use-library-metadata");

			// Grid page 1 is the visible content — prefetch it into the infinite
			// query's cache entry so the grid renders instantly on mount.
			await Promise.all([
				queryClient.infiniteQuery(libraryMetadataInfiniteQueryOptions(id, "tv_show")),
				queryClient.query(libraryDetailQueryOptions(id)),
				queryClient.query(librariesQueryOptions("tv_shows")),
			]);
		});
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { id } = Route.useParams();

	return <SeriesLibraryPage id={id} />;
}
