import { createFileRoute } from "@tanstack/react-router";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const DevicesPage = lazyRouteComponent(() => import("@/pages/user/devices/devices-page"));

export const Route = createFileRoute("/_user/devices")({
	loader: ({ context: { queryClient } }) => {
		detach(async () => {
			const { sessionsQueryOptions } = await import("@/client/hooks/use-sessions");

			await queryClient.query({
				...sessionsQueryOptions(),
				staleTime: "static",
			});
		});
	},
	component: DevicesPage,
});
