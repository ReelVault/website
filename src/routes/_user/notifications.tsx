import { createFileRoute } from "@tanstack/react-router";
import { notificationsQueryOptions } from "@/client/hooks/use-notifications";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const NotificationsPage = lazyRouteComponent(() => import("@/pages/user/notifications/notifications-page"));

export const Route = createFileRoute("/_user/notifications")({
	loader: ({ context: { queryClient } }) => {
		detach(
			queryClient.query({
				...notificationsQueryOptions(),
				staleTime: "static",
			}),
		);
	},
	component: NotificationsPage,
});
