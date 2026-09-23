import { createFileRoute } from "@tanstack/react-router";
import { metadataPopularQueryOptions } from "@/client/hooks/use-metadata-queries";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const DashboardPage = lazyRouteComponent(() => import("@/pages/web/dashboard/dashboard-page"));

export const Route = createFileRoute("/_web/dashboard")({
	loader: ({ context: { queryClient } }) => {
		detach(queryClient.query(metadataPopularQueryOptions(12)));
	},
	component: DashboardPage,
});
