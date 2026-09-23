import { createFileRoute } from "@tanstack/react-router";
import { collectionDetailsQueryOptions } from "@/client/hooks/use-collections";
import { metadataCollectionQueryOptions } from "@/client/hooks/use-metadata-queries";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const CollectionDetailPage = lazyRouteComponent(() => import("@/pages/web/collections/collection-by-id-page"));

export const Route = createFileRoute("/_web/collections/$id")({
	loader: ({ context: { queryClient }, params: { id } }) => {
		detach(queryClient.query({ ...collectionDetailsQueryOptions(id), staleTime: "static" }));
		detach(queryClient.query({ ...metadataCollectionQueryOptions(id), staleTime: "static" }));
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { id } = Route.useParams();

	return <CollectionDetailPage id={id} />;
}
