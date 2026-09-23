import { createFileRoute } from "@tanstack/react-router";
import { collectionsPageQueryOptions } from "@/client/hooks/use-collections";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const CollectionsPage = lazyRouteComponent(() => import("@/pages/web/collections/collections-page"));

export const Route = createFileRoute("/_web/collections/")({
	loader: ({ context: { queryClient } }) => {
		detach(queryClient.query(collectionsPageQueryOptions(1)));
	},
	component: CollectionsPage,
});
