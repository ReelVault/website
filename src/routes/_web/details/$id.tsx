import { createFileRoute } from "@tanstack/react-router";
import { detailsViewQueryOptions } from "@/client/hooks/use-metadata-queries";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const DetailsPage = lazyRouteComponent(() => import("@/pages/web/details/details-page"));

export const Route = createFileRoute("/_web/details/$id")({
	loader: ({ context: { queryClient }, params: { id } }) => {
		detach(queryClient.query(detailsViewQueryOptions(id)));
	},
	component: DetailsPage,
});
