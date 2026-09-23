import { createFileRoute } from "@tanstack/react-router";
import { taxonomyDetailsQueryOptions } from "@/client/hooks/use-taxonomy-details";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const GenreDetailPage = lazyRouteComponent(() => import("@/pages/web/genres/genre-by-id-page"));

export const Route = createFileRoute("/_web/genres/$id")({
	loader: ({ context: { queryClient }, params }) => {
		detach(
			queryClient.query({
				...taxonomyDetailsQueryOptions("genre", params.id),
				staleTime: "static",
			}),
		);
	},
	component: GenreDetailPage,
});
