import { createFileRoute } from "@tanstack/react-router";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const HistoryPage = lazyRouteComponent(() => import("@/pages/user/history/history-page"));

export const Route = createFileRoute("/_user/history")({
	loader: ({ context: { queryClient } }) => {
		detach(async () => {
			const { watchedHistoryQueryOptions } = await import("@/client/hooks/use-watched-history");

			await queryClient.query({
				...watchedHistoryQueryOptions(100),
				staleTime: "static",
			});
		});
	},
	component: HistoryPage,
});
