import { createFileRoute } from "@tanstack/react-router";
import { watchlistQueryOptions } from "@/client/hooks/use-watchlist";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const WatchlistPage = lazyRouteComponent(() => import("@/pages/web/watchlist/watchlist-page"));

export const Route = createFileRoute("/_web/watchlist")({
	loader: ({ context: { queryClient } }) => {
		detach(
			queryClient.query({
				...watchlistQueryOptions(),
				staleTime: "static",
			}),
		);
	},
	component: WatchlistPage,
});
