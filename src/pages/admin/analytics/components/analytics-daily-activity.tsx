import type { AdminAnalytics } from "@reelvault/sdk";
import { m } from "@/paraglide/messages";

export function AnalyticsDailyActivity({ dailyActivity }: { dailyActivity: AdminAnalytics["dailyActivity"] }) {
	if (dailyActivity.length === 0) {
		return <p className="text-muted-foreground text-sm">{m.admin_analytics_no_daily_activity()}</p>;
	}

	const maxMinutes = Math.max(1, ...dailyActivity.map((day) => day.minutes));

	return (
		<div className="flex flex-col gap-2">
			{dailyActivity.map((day) => (
				<div key={day.date} className="flex items-center gap-3">
					<span className="text-muted-foreground w-24 shrink-0 font-mono text-xs">{day.date}</span>
					<div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
						<div className="bg-primary h-full rounded-full" style={{ width: `${Math.round((day.minutes / maxMinutes) * 100)}%` }} />
					</div>
					<span className="text-muted-foreground w-32 shrink-0 text-right font-mono text-xs">
						{m.admin_analytics_daily_activity_value({ minutes: day.minutes, plays: day.playCount })}
					</span>
				</div>
			))}
		</div>
	);
}
