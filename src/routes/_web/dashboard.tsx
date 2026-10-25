import { createFileRoute } from "@tanstack/react-router";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const DashboardPage = lazyRouteComponent(() => import("@/pages/web/dashboard/dashboard-page"));

export const Route = createFileRoute("/_web/dashboard")({
	loader: ({ context: { queryClient } }) => {
		detach(async () => {
			const { metadataPopularQueryOptions } = await import("@/client/hooks/use-metadata-queries");

			await queryClient.query(metadataPopularQueryOptions(12));
		});
	},
	component: DashboardPage,
});
