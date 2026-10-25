import { createFileRoute } from "@tanstack/react-router";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const DetailsPage = lazyRouteComponent(() => import("@/pages/web/details/details-page"));

export const Route = createFileRoute("/_web/details/$id")({
	loader: ({ context: { queryClient }, params: { id } }) => {
		detach(async () => {
			const { detailsViewQueryOptions } = await import("@/client/hooks/use-metadata-queries");

			await queryClient.query(detailsViewQueryOptions(id));
		});
	},
	component: DetailsPage,
});
