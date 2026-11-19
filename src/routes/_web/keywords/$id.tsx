import { createFileRoute } from "@tanstack/react-router";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";
import { validatePageSearch } from "@/routes/-search-params";

const KeywordDetailPage = lazyRouteComponent(() => import("@/pages/web/keywords/keyword-by-id-page"));

export const Route = createFileRoute("/_web/keywords/$id")({
	validateSearch: validatePageSearch,
	loader: ({ context: { queryClient }, params }) => {
		detach(async () => {
			const { taxonomyDetailsQueryOptions } = await import("@/client/hooks/use-taxonomy-details");

			await queryClient.query({
				...taxonomyDetailsQueryOptions("keyword", params.id),
				staleTime: "static",
			});
		});
	},
	component: KeywordDetailPage,
});
