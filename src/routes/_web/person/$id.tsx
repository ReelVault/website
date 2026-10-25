import { createFileRoute } from "@tanstack/react-router";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const PersonDetailPage = lazyRouteComponent(() => import("@/pages/web/person/person-page"));

export const Route = createFileRoute("/_web/person/$id")({
	loader: ({ context: { queryClient }, params: { id } }) => {
		detach(async () => {
			const { personMetadataQueryOptions, personQueryOptions } = await import("@/client/hooks/use-person-data");

			await Promise.all([
				queryClient.query({ ...personQueryOptions(id), staleTime: "static" }),
				queryClient.query({ ...personMetadataQueryOptions(id), staleTime: "static" }),
			]);
		});
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { id } = Route.useParams();

	return <PersonDetailPage id={id} />;
}
