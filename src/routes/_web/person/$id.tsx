import { createFileRoute } from "@tanstack/react-router";
import { personMetadataQueryOptions, personQueryOptions } from "@/client/hooks/use-person-data";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const PersonDetailPage = lazyRouteComponent(() => import("@/pages/web/person/person-page"));

export const Route = createFileRoute("/_web/person/$id")({
	loader: ({ context: { queryClient }, params: { id } }) => {
		detach(queryClient.query({ ...personQueryOptions(id), staleTime: "static" }));
		detach(queryClient.query({ ...personMetadataQueryOptions(id), staleTime: "static" }));
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { id } = Route.useParams();

	return <PersonDetailPage id={id} />;
}
