import { createFileRoute } from "@tanstack/react-router";
import { discoveryQueryOptions } from "@/client/hooks/use-discovery";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const DiscoveryPage = lazyRouteComponent(() => import("@/pages/web/discovery/discovery-page"));

export const Route = createFileRoute("/_web/discovery")({
	loader: ({ context: { queryClient } }) => {
		detach(
			queryClient.query({
				...discoveryQueryOptions(),
				staleTime: "static",
			}),
		);
	},
	component: DiscoveryPage,
});
