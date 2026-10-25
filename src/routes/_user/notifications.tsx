import { createFileRoute } from "@tanstack/react-router";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const NotificationsPage = lazyRouteComponent(() => import("@/pages/user/notifications/notifications-page"));

export const Route = createFileRoute("/_user/notifications")({
	loader: ({ context: { queryClient } }) => {
		detach(async () => {
			const { notificationsQueryOptions } = await import("@/client/hooks/use-notifications");

			await queryClient.query({
				...notificationsQueryOptions(),
				staleTime: "static",
			});
		});
	},
	component: NotificationsPage,
});
