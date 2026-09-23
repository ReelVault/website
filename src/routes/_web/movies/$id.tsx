import { createFileRoute } from "@tanstack/react-router";
import { librariesQueryOptions, libraryDetailQueryOptions } from "@/client/hooks/use-libraries";
import { libraryMetadataInfiniteQueryOptions } from "@/client/hooks/use-library-metadata";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const MovieLibraryPage = lazyRouteComponent(() => import("@/pages/web/_libraries/movies/movies-by-id-page"));

export const Route = createFileRoute("/_web/movies/$id")({
	loader: ({ context: { queryClient }, params: { id } }) => {
		// Grid page 1 is the visible content — prefetch it into the infinite
		// query's cache entry so the grid renders instantly on mount.
		detach(queryClient.infiniteQuery(libraryMetadataInfiniteQueryOptions(id, "movie")));
		detach(queryClient.query(libraryDetailQueryOptions(id)));
		detach(queryClient.query(librariesQueryOptions("movies")));
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { id } = Route.useParams();

	return <MovieLibraryPage id={id} />;
}
