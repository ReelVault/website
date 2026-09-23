import { createFileRoute } from "@tanstack/react-router";
import { taxonomyDetailsQueryOptions } from "@/client/hooks/use-taxonomy-details";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const KeywordDetailPage = lazyRouteComponent(() => import("@/pages/web/keywords/keyword-by-id-page"));

export const Route = createFileRoute("/_web/keywords/$id")({
	loader: ({ context: { queryClient }, params }) => {
		detach(
			queryClient.query({
				...taxonomyDetailsQueryOptions("keyword", params.id),
				staleTime: "static",
			}),
		);
	},
	component: KeywordDetailPage,
});
