import { Calendar, Flame, Zap } from "lucide-react";
import type { WrappedInsights } from "reelvault-sdk";
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
				<Badge
					variant="outline"
					className="mb-2 border-primary/50 bg-primary/10 px-3 py-1 font-bold text-primary text-xs uppercase tracking-wider"
				>
					{m.user_habits_and_records()}
				</Badge>
				<h3 className="font-black text-2xl text-foreground sm:text-4xl">{m.user_when_watch_most()}</h3>
				<p className="mt-1 text-muted-foreground text-sm">{m.user_favorite_relax_hours()}</p>
			</div>

			<div className="grid grid-cols-1 gap-6 pt-4 sm:grid-cols-3">
				<div className="flex flex-col items-center justify-center rounded-2xl border border-border/70 bg-card/60 p-6 shadow-sm">
					<Calendar className="mb-3 size-7 text-primary" />
					<p className="font-bold text-[11px] text-muted-foreground uppercase tracking-wider">{m.user_best_month()}</p>
					<p className="mt-2 font-black text-2xl text-primary">
						{data.peakMonth ? formatMonthName(data.peakMonth.month) : m.common_no_value()}
					</p>
					<p className="mt-1 text-muted-foreground text-xs">
						{data.peakMonth ? m.user_minute_h_month({ minutes60: Math.floor(data.peakMonth.minutes / 60) }) : ""}
					</p>
				</div>

				<div className="flex flex-col items-center justify-center rounded-2xl border border-border/70 bg-card/60 p-6 shadow-sm">
					<Flame className="mb-3 size-7 fill-current text-amber-400" />
					<p className="font-bold text-[11px] text-muted-foreground uppercase tracking-wider">{m.user_favorite_day()}</p>
					<p className="mt-2 font-black text-2xl text-amber-400">
						{data.peakDayOfWeek ? formatWeekdayName(data.peakDayOfWeek.dayOfWeek) : m.common_no_value()}
					</p>
					<p className="mt-1 text-muted-foreground text-xs">{m.user_biggest_chill_day()}</p>
				</div>

				<div className="flex flex-col items-center justify-center rounded-2xl border border-border/70 bg-card/60 p-6 shadow-sm">
					<Zap className="mb-3 size-7 text-purple-400" />
					<p className="font-bold text-[11px] text-muted-foreground uppercase tracking-wider">{m.user_longest_marathon()}</p>
					<p className="mt-2 font-black text-2xl text-purple-400">
						{m.user_marathon_duration({
							hours: Math.floor(data.longestMarathonMinutes / 60),
							minutes: data.longestMarathonMinutes % 60,
						})}
					</p>
					<p className="mt-1 text-muted-foreground text-xs">{m.user_in_single_day()}</p>
				</div>
			</div>
		</div>
	);
}
