import type { InsightsRange } from "@reelvault/sdk";
import { useState } from "react";
import { useInsights } from "@/client/hooks/use-insights";
import { AppErrorState } from "@/components/app-states";
import { LazyRender } from "@/components/lazy-render";
import { SimpleAnimation } from "@/components/simple-animation";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { UserPageHeader } from "../components/user-ui";
import { InsightsGenresDistribution } from "./components/insights-genres-distribution";
import { InsightsHourlyHeatmap } from "./components/insights-hourly-heatmap";
import { InsightsMetricsRibbon } from "./components/insights-metrics-ribbon";
import { InsightsSkeleton } from "./components/insights-skeleton";
import { InsightsTopContent } from "./components/insights-top-content";
import { InsightsWrappedModal } from "./components/insights-wrapped-modal";
import { InsightsKpiGrid } from "./sections/insights-kpi-grid";

const TIME_RANGES: Array<{ value: InsightsRange; label: string }> = [
	{ value: "7d", label: m.user_insights_period_7d() },
	{ value: "30d", label: m.user_insights_period_30d() },
	{ value: "90d", label: m.user_insights_period_90d() },
	{ value: "1y", label: m.user_insights_period_1y() },
	{ value: "all", label: m.common_all() },
];

export default function InsightsPage() {
	const [selectedRange, setSelectedRange] = useState<InsightsRange>("30d");
	const insightsQuery = useInsights(selectedRange);
	const insight = insightsQuery.data;

	if (insightsQuery.isLoading) {
		return <InsightsSkeleton />;
	}

	if (insightsQuery.isError || !insight) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center">
				<AppErrorState
					title={m.user_stats_fetch_failed()}
					description={m.user_check_server_connection()}
					error={insightsQuery.error}
					onRetry={() => detach(insightsQuery.refetch())}
				/>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-8 pb-16">
			{/* Page Header */}
			<UserPageHeader
				eyebrow={m.user_insights_eyebrow()}
				title={m.user_insights_heading()}
				description={m.user_insights_description()}
				action={
					<div className="flex flex-wrap items-center gap-3">
						<InsightsWrappedModal />

						<div className="flex gap-1 rounded-xl border border-border/70 bg-card/70 p-1">
							{TIME_RANGES.map((range) => (
								<Button
									key={range.value}
									type="button"
									size="sm"
									variant={selectedRange === range.value ? "default" : "ghost"}
									onClick={() => setSelectedRange(range.value)}
									className="h-9 text-xs sm:h-7"
								>
									{range.label}
								</Button>
							))}
						</div>
					</div>
				}
			/>

			{/* KPI Summary Grid */}
			<InsightsKpiGrid insight={insight} selectedRange={selectedRange} />

			{/* Extra KPI Metric Cards */}
			<InsightsMetricsRibbon insight={insight} />

			{/* Top Watched Content Podium */}
			<LazyRender minHeight={300} rootMargin="350px 0px">
				{() => (
					<SimpleAnimation direction="up" duration={260}>
						<InsightsTopContent topMovies={insight.topMovies} topShows={insight.topShows} />
					</SimpleAnimation>
				)}
			</LazyRender>

			{/* Heatmap & Genre Distribution Grid */}
			<LazyRender minHeight={350} rootMargin="350px 0px">
				{() => (
					<SimpleAnimation direction="up" duration={260}>
						<div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
							<InsightsHourlyHeatmap heatmap={insight.hourlyHeatmap} />
							<InsightsGenresDistribution genres={insight.genresDistribution} />
						</div>
					</SimpleAnimation>
				)}
			</LazyRender>
		</div>
	);
}
