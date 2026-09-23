import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminAnalyticsPage = lazyRouteComponent(() => import("@/pages/admin/analytics/analytics-page"));

function adminAnalyticsSearchValidator(search: Record<string, unknown>): { days?: number } {
	return {
		days: Number.isFinite(Number(search.days)) && Number(search.days) > 0 ? Number(search.days) : undefined,
	};
}

export const Route = createFileRoute("/admin/analytics")({
	validateSearch: adminAnalyticsSearchValidator,
	component: AdminAnalyticsPage,
});
