import { createFileRoute } from "@tanstack/react-router";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";
import { validatePageSearch } from "@/routes/-search-params";

const CollectionsPage = lazyRouteComponent(() => import("@/pages/web/collections/collections-page"));

export const Route = createFileRoute("/_web/collections/")({
	validateSearch: validatePageSearch,
	loader: ({ context: { queryClient } }) => {
		detach(async () => {
			const { collectionsPageQueryOptions } = await import("@/client/hooks/use-collections");

			await queryClient.query(collectionsPageQueryOptions(1));
		});
	},
	component: CollectionsPage,
});
