import { createFileRoute } from "@tanstack/react-router";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";
import { validatePageSearch } from "@/routes/-search-params";

const GenreDetailPage = lazyRouteComponent(() => import("@/pages/web/genres/genre-by-id-page"));

export const Route = createFileRoute("/_web/genres/$id")({
	validateSearch: validatePageSearch,
	loader: ({ context: { queryClient }, params }) => {
		detach(async () => {
			const { taxonomyDetailsQueryOptions } = await import("@/client/hooks/use-taxonomy-details");

			await queryClient.query({
				...taxonomyDetailsQueryOptions("genre", params.id),
				staleTime: "static",
			});
		});
	},
	component: GenreDetailPage,
});
