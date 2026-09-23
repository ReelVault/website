import type { AdminAnalytics } from "@reelvault/sdk";
import { Clock, Play, Trophy, Users } from "lucide-react";
import { AdminStat } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";

interface AnalyticsKpiGridProps {
	data: Pick<AdminAnalytics, "totalWatchMinutes" | "totalPlaysCount" | "activeUsersCount" | "mostWatchedTitle">;
}

export function AnalyticsKpiGrid({ data }: AnalyticsKpiGridProps) {
	const totalHours = Math.floor(data.totalWatchMinutes / 60);
	const totalMins = data.totalWatchMinutes % 60;
	const formattedTotalTime = `${totalHours}h ${totalMins}m`;

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<AdminStat label={m.admin_analytics_total_play_time()} value={formattedTotalTime} icon={Clock} />
			<AdminStat label={m.admin_analytics_session_count()} value={data.totalPlaysCount} icon={Play} />
			<AdminStat label={m.admin_analytics_active_viewers()} value={data.activeUsersCount} icon={Users} />
			<AdminStat label={m.admin_analytics_most_popular_title()} value={data.mostWatchedTitle?.title ?? "—"} icon={Trophy} />
		</div>
	);
}
