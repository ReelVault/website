import { createFileRoute } from "@tanstack/react-router";
import { insightsQueryOptions } from "@/client/hooks/use-insights";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const InsightsPage = lazyRouteComponent(() => import("@/pages/user/insights/insights-page"));

export const Route = createFileRoute("/_user/insights")({
	loader: ({ context: { queryClient } }) => {
		detach(
			queryClient.query({
				...insightsQueryOptions("30d"),
				staleTime: "static",
			}),
		);
	},
	component: InsightsPage,
});
