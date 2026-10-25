import { createFileRoute } from "@tanstack/react-router";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const InsightsPage = lazyRouteComponent(() => import("@/pages/user/insights/insights-page"));

export const Route = createFileRoute("/_user/insights")({
	loader: ({ context: { queryClient } }) => {
		detach(async () => {
			const { insightsQueryOptions } = await import("@/client/hooks/use-insights");

			await queryClient.query({
				...insightsQueryOptions("30d"),
				staleTime: "static",
			});
		});
	},
	component: InsightsPage,
});
