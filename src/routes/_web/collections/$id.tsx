import { createFileRoute } from "@tanstack/react-router";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const CollectionDetailPage = lazyRouteComponent(() => import("@/pages/web/collections/collection-by-id-page"));

export const Route = createFileRoute("/_web/collections/$id")({
	loader: ({ context: { queryClient }, params: { id } }) => {
		detach(async () => {
			const [{ collectionDetailsQueryOptions }, { metadataCollectionQueryOptions }] = await Promise.all([
				import("@/client/hooks/use-collections"),
				import("@/client/hooks/use-metadata-queries"),
			]);

			await Promise.all([
				queryClient.query({ ...collectionDetailsQueryOptions(id), staleTime: "static" }),
				queryClient.query({ ...metadataCollectionQueryOptions(id), staleTime: "static" }),
			]);
		});
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { id } = Route.useParams();

	return <CollectionDetailPage id={id} />;
}
