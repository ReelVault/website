import type { InsightsRange, ProfileInsights } from "reelvault-sdk";
import { SimpleAnimation } from "@/components/simple-animation";
import { m } from "@/paraglide/messages";
import { formatWeekday } from "@/utils/format-utils";
import { InsightsActivityChart } from "../components/insights-activity-chart";
import { InsightsSummaryCards } from "../components/insights-summary-cards";
import { InsightsTopGenreCard } from "../components/insights-top-genre-card";
import { InsightsWatchTimeCard } from "../components/insights-watch-time-card";

interface InsightsKpiGridProps {
	insight: ProfileInsights;
	selectedRange: InsightsRange;
}

export function InsightsKpiGrid({ insight, selectedRange }: InsightsKpiGridProps) {
	const totalWatchTime = {
		days: Math.floor(insight.totalMinutes / 1440),
		hours: Math.floor((insight.totalMinutes % 1440) / 60),
	};

	const monthlyIncrease = {
		value: Math.abs(Math.round((insight.totalMinutes - insight.previousPeriodMinutes) / 60)),
		trend: insight.totalMinutes >= insight.previousPeriodMinutes ? ("up" as const) : ("down" as const),
	};

	const dailyAverage = `${Math.floor(insight.dailyAverageMinutes / 60)}h ${insight.dailyAverageMinutes % 60}m`;

	const topGenre = {
		name: insight.topGenre?.name ?? m.user_no_data_fallback(),
		match: insight.totalMinutes ? Math.round(((insight.topGenre?.minutes ?? 0) / insight.totalMinutes) * 100) : 0,
	};

	const topActor = {
		name: insight.topActor?.name ?? m.user_no_data_fallback(),
		productions: insight.topActor?.minutes ?? 0,
	};

	const weeklyActivity = insight.dailyActivity.map((item) => ({
		date: item.date,
		day: formatWeekday(`${item.date}T12:00:00`),
		value: item.minutes,
	}));

	const maxActivity = Math.max(...weeklyActivity.map((item) => item.value), 1);

	return (
		<SimpleAnimation direction="up" duration={260}>
			<div className="grid auto-rows-45 grid-cols-1 gap-6 md:grid-cols-6 lg:grid-cols-12">
				<InsightsWatchTimeCard totalWatchTime={totalWatchTime} monthlyIncrease={monthlyIncrease} dailyAverage={dailyAverage} />
				<InsightsTopGenreCard topGenre={topGenre} />
				<InsightsSummaryCards scannedTitles={insight.titlesWatched} topActor={topActor} />
				<InsightsActivityChart weeklyActivity={weeklyActivity} maxActivity={maxActivity} selectedRange={selectedRange} />
			</div>
		</SimpleAnimation>
	);
}
