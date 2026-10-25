import type { WrappedInsights } from "@reelvault/sdk";
import { Calendar, Flame, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { m } from "@/paraglide/messages";
import { formatMonthName, formatWeekdayName } from "@/utils/date-utils";

interface WrappedHabitsSlideProps {
	data: WrappedInsights;
}

export function WrappedHabitsSlide({ data }: WrappedHabitsSlideProps) {
	return (
		<div className="fade-in zoom-in-95 animate-in space-y-6 py-2 text-center duration-300">
			<div>
				<Badge weight="bold" variant="primary" className="mb-2">
					{m.user_habits_and_records()}
				</Badge>
				<h3 className="text-foreground text-2xl font-black sm:text-4xl">{m.user_when_watch_most()}</h3>
				<p className="text-muted-foreground mt-1 text-sm">{m.user_favorite_relax_hours()}</p>
			</div>

			<div className="grid grid-cols-1 gap-6 pt-4 sm:grid-cols-3">
				<div className="border-border/70 bg-card/60 flex flex-col items-center justify-center rounded-2xl border p-6 shadow-sm">
					<Calendar className="text-primary mb-3 size-7" />
					<p className="text-muted-foreground text-xs font-bold">{m.user_best_month()}</p>
					<p className="text-primary mt-2 text-2xl font-black">
						{data.peakMonth ? formatMonthName(data.peakMonth.month) : m.common_no_value()}
					</p>
					<p className="text-muted-foreground mt-1 text-xs">
						{data.peakMonth ? m.user_minute_h_month({ minutes60: Math.floor(data.peakMonth.minutes / 60) }) : ""}
					</p>
				</div>

				<div className="border-border/70 bg-card/60 flex flex-col items-center justify-center rounded-2xl border p-6 shadow-sm">
					<Flame className="mb-3 size-7 fill-current text-amber-400" />
					<p className="text-muted-foreground text-xs font-bold">{m.user_favorite_day()}</p>
					<p className="mt-2 text-2xl font-black text-amber-400">
						{data.peakDayOfWeek ? formatWeekdayName(data.peakDayOfWeek.dayOfWeek) : m.common_no_value()}
					</p>
					<p className="text-muted-foreground mt-1 text-xs">{m.user_biggest_chill_day()}</p>
				</div>

				<div className="border-border/70 bg-card/60 flex flex-col items-center justify-center rounded-2xl border p-6 shadow-sm">
					<Zap className="mb-3 size-7 text-purple-400" />
					<p className="text-muted-foreground text-xs font-bold">{m.user_longest_marathon()}</p>
					<p className="mt-2 text-2xl font-black text-purple-400">
						{m.user_marathon_duration({
							hours: Math.floor(data.longestMarathonMinutes / 60),
							minutes: data.longestMarathonMinutes % 60,
						})}
					</p>
					<p className="text-muted-foreground mt-1 text-xs">{m.user_in_single_day()}</p>
				</div>
			</div>
		</div>
	);
}
