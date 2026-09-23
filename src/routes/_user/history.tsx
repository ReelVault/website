import { createFileRoute } from "@tanstack/react-router";
import { watchedHistoryQueryOptions } from "@/client/hooks/use-watched-history";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const HistoryPage = lazyRouteComponent(() => import("@/pages/user/history/history-page"));

export const Route = createFileRoute("/_user/history")({
	loader: ({ context: { queryClient } }) => {
		detach(
			queryClient.query({
				...watchedHistoryQueryOptions(100),
				staleTime: "static",
			}),
		);
	},
	component: HistoryPage,
});
