import { createFileRoute } from "@tanstack/react-router";
import { librariesQueryOptions, libraryDetailQueryOptions } from "@/client/library-queries";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const MovieLibraryPage = lazyRouteComponent(() => import("@/pages/web/_libraries/movies/movies-by-id-page"));

export const Route = createFileRoute("/_web/movies/$id")({
	loader: ({ context: { queryClient }, params: { id } }) => {
		// The grid options module comes with the page chunk; loading it here would
		// put it in the eager graph for a prefetch that is fire-and-forget anyway.
		detach(async () => {
			const { libraryMetadataInfiniteQueryOptions } = await import("@/client/hooks/use-library-metadata");

			// Grid page 1 is the visible content — prefetch it into the infinite
			// query's cache entry so the grid renders instantly on mount.
			await Promise.all([
				queryClient.infiniteQuery(libraryMetadataInfiniteQueryOptions(id, "movie")),
				queryClient.query(libraryDetailQueryOptions(id)),
				queryClient.query(librariesQueryOptions("movies")),
			]);
		});
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { id } = Route.useParams();

	return <MovieLibraryPage id={id} />;
}
