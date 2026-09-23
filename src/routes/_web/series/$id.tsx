import { createFileRoute } from "@tanstack/react-router";
import { librariesQueryOptions, libraryDetailQueryOptions } from "@/client/hooks/use-libraries";
import { libraryMetadataInfiniteQueryOptions } from "@/client/hooks/use-library-metadata";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const SeriesLibraryPage = lazyRouteComponent(() => import("@/pages/web/_libraries/series/series-by-id-page"));

export const Route = createFileRoute("/_web/series/$id")({
	loader: ({ context: { queryClient }, params: { id } }) => {
		// Grid page 1 is the visible content — prefetch it into the infinite
		// query's cache entry so the grid renders instantly on mount.
		detach(queryClient.infiniteQuery(libraryMetadataInfiniteQueryOptions(id, "tv_show")));
		detach(queryClient.query(libraryDetailQueryOptions(id)));
		detach(queryClient.query(librariesQueryOptions("tv_shows")));
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { id } = Route.useParams();

	return <SeriesLibraryPage id={id} />;
}
