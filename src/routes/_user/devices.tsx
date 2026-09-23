import { createFileRoute } from "@tanstack/react-router";
import { sessionsQueryOptions } from "@/client/hooks/use-sessions";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const DevicesPage = lazyRouteComponent(() => import("@/pages/user/devices/devices-page"));

export const Route = createFileRoute("/_user/devices")({
	loader: ({ context: { queryClient } }) => {
		detach(
			queryClient.query({
				...sessionsQueryOptions(),
				staleTime: "static",
			}),
		);
	},
	component: DevicesPage,
});
