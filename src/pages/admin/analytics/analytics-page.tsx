import { useNavigate, useSearch } from "@tanstack/react-router";
import { cn } from "cn";
import { BarChart3, RefreshCw } from "lucide-react";
import type { MouseEvent } from "react";
import { useAdminAnalytics } from "@/client/hooks/use-insights";
import { AppErrorState, AppLoadingState } from "@/components/app-states";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
import { AdminPageHeader, AdminSection } from "@/pages/admin/admin-ui";
import { InsightsHourlyHeatmap } from "@/pages/user/insights/components/insights-hourly-heatmap";
import { m } from "@/paraglide/messages";
import { AdminLiveActivitySection } from "../_components/admin-live-activity-section";
import { AnalyticsDailyActivity } from "./components/analytics-daily-activity";
import { AnalyticsKpiGrid } from "./components/analytics-kpi-grid";
import { AnalyticsRecentStreams } from "./components/analytics-recent-streams";
import { AnalyticsTopContent } from "./components/analytics-top-content";
import { AnalyticsUserLeaderboard } from "./components/analytics-user-leaderboard";

const TIME_FILTER_OPTIONS = [
	{ days: 7, label: m.admin_analytics_period_7d() },
	{ days: 30, label: m.admin_analytics_period_30d() },
	{ days: 90, label: m.admin_analytics_period_90d() },
	{ days: 365, label: m.admin_analytics_period_1y() },
	{ days: undefined, label: m.admin_analytics_full_history() },
] as const;

export default function AdminAnalyticsPage() {
	const search = useSearch({ from: "/admin/analytics" });
	const navigate = useNavigate({ from: "/admin/analytics" });
	const selectedDays = search.days ?? 30;
	const analyticsQuery = useAdminAnalytics(selectedDays);
	const data = analyticsQuery.data;

	const handleRefetchAnalytics = () => {
		detach(analyticsQuery.refetch());
	};

	const handleTimeFilterChange = (event: MouseEvent<HTMLButtonElement>) => {
		const days = event.currentTarget.dataset.days;
		const nextDays = days === "all" ? undefined : Number(days);
		detach(navigate({ search: (prev) => ({ ...prev, days: nextDays }), replace: true }));
	};

	if (analyticsQuery.isLoading) {
		return <AppLoadingState label={m.admin_analytics_loading()} className="min-h-96" />;
	}

	if (analyticsQuery.isError || !data) {
		return (
			<AppErrorState
				title={m.admin_analytics_loading_error()}
				description={m.admin_analytics_failed_to_fetch_stats()}
				error={analyticsQuery.error}
				onRetry={handleRefetchAnalytics}
			/>
		);
	}

	return (
		<div className="flex flex-col gap-8 text-foreground">
			{/* Page Header */}
			<AdminPageHeader
				icon={BarChart3}
				eyebrow={m.admin_analytics_watch_statistics()}
				title={m.admin_analytics_heading()}
				description={m.admin_analytics_overview_description()}
				actions={
					<div className="flex flex-wrap items-center gap-2">
						<div className="flex w-full min-w-0 gap-1 overflow-x-auto rounded-xl border border-border/70 bg-card/70 p-1 sm:w-auto">
							{TIME_FILTER_OPTIONS.map((opt) => (
								<Button
									key={opt.label}
									type="button"
									data-days={opt.days ?? "all"}
									size="sm"
									variant={selectedDays === opt.days ? "default" : "ghost"}
									onClick={handleTimeFilterChange}
									className="h-9 shrink-0 text-xs sm:h-7"
								>
									{opt.label}
								</Button>
							))}
						</div>

						<Button type="button" variant="outline" size="sm" onClick={handleRefetchAnalytics} className="gap-1.5 text-xs">
							<RefreshCw className={cn("size-3.5", { "animate-spin": analyticsQuery.isFetching })} />
							{m.common_refresh()}
						</Button>
					</div>
				}
			/>

			{/* Live activity & restart-readiness monitor */}
			<AdminLiveActivitySection />

			{/* KPI Statistics Grid */}
			<AnalyticsKpiGrid data={data} />

			{/* User Leaderboard & Top Content Grid */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
				<AnalyticsUserLeaderboard leaderboard={data.userLeaderboard} />
				<AnalyticsTopContent topContent={data.topContent} />
			</div>

			{/* Heatmap Section */}
			<AdminSection title={m.admin_analytics_activity_hours()}>
				<InsightsHourlyHeatmap heatmap={data.hourlyActivity} />
			</AdminSection>

			{/* Daily activity (minutes + play count per day) */}
			<AdminSection title={m.admin_analytics_daily_activity()}>
				<AnalyticsDailyActivity dailyActivity={data.dailyActivity} />
			</AdminSection>

			{/* Recent Stream Activity Table */}
			<AnalyticsRecentStreams recentPlays={data.recentPlays} />
		</div>
	);
}
