import { createFileRoute } from "@tanstack/react-router";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const DiscoveryPage = lazyRouteComponent(() => import("@/pages/web/discovery/discovery-page"));

export const Route = createFileRoute("/_web/discovery")({
	loader: ({ context: { queryClient } }) => {
		detach(async () => {
			const { discoveryQueryOptions } = await import("@/client/hooks/use-discovery");

			await queryClient.query({
				...discoveryQueryOptions(),
				staleTime: "static",
			});
		});
	},
	component: DiscoveryPage,
});
