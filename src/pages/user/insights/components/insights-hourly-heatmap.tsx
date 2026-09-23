import { cn } from "cn";
import { Calendar, Flame, Info } from "lucide-react";
import type { HourlyHeatmapPoint } from "@reelvault/sdk";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { m } from "@/paraglide/messages";

interface InsightsHourlyHeatmapProps {
	heatmap: HourlyHeatmapPoint[];
}

const DAYS_ORDER: ReadonlyArray<{
	index: number;
	readonly label: string;
	readonly fullName: string;
}> = [
	{
		index: 1,
		get label() {
			return m.common_day_mon_short();
		},
		get fullName() {
			return m.admin_worker_monday();
		},
	},
	{
		index: 2,
		get label() {
			return m.common_day_tue_short();
		},
		get fullName() {
			return m.common_day_tue();
		},
	},
	{
		index: 3,
		get label() {
			return m.admin_worker_wed();
		},
		get fullName() {
			return m.admin_worker_wednesday();
		},
	},
	{
		index: 4,
		get label() {
			return m.common_day_thu_short();
		},
		get fullName() {
			return m.common_day_thu();
		},
	},
	{
		index: 5,
		get label() {
			return m.common_day_fri_short();
		},
		get fullName() {
			return m.admin_worker_friday();
		},
	},
	{
		index: 6,
		get label() {
			return m.common_day_sat_short();
		},
		get fullName() {
			return m.common_day_sat();
		},
	},
	{
		index: 0,
		get label() {
			return m.common_day_sun_short();
		},
		get fullName() {
			return m.common_day_sun();
		},
	},
];

const DAY_FULL_NAMES: Record<number, string> = {
	get 1() {
		return m.admin_worker_monday();
	},
	get 2() {
		return m.common_day_tue();
	},
	get 3() {
		return m.admin_worker_wednesday();
	},
	get 4() {
		return m.common_day_thu();
	},
	get 5() {
		return m.admin_worker_friday();
	},
	get 6() {
		return m.common_day_sat();
	},
	get 0() {
		return m.common_day_sun();
	},
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function InsightsHourlyHeatmap({ heatmap }: InsightsHourlyHeatmapProps) {
	// Build map: key = `${dayOfWeek}-${hour}`
	const dataMap = new Map<string, number>();
	let maxMinutes = 0;
	let peakHour = 20;
	let peakDay = 5;
	let maxSlot = 0;

	for (const point of heatmap) {
		const key = `${point.dayOfWeek}-${point.hour}`;
		dataMap.set(key, point.minutes);
		if (point.minutes > maxMinutes) maxMinutes = point.minutes;

		if (point.minutes > maxSlot) {
			maxSlot = point.minutes;
			peakHour = point.hour;
			peakDay = point.dayOfWeek;
		}
	}

	const peakDayName = DAY_FULL_NAMES[peakDay] ?? "Weekend";

	// TODO: handle better
	const getCellColor = (minutes: number) => {
		if (minutes === 0) return "bg-muted/30 border border-border/30 hover:border-primary/50";

		const ratio = maxMinutes > 0 ? minutes / maxMinutes : 0;
		if (ratio < 0.25) return "bg-primary/20 border border-primary/30 hover:bg-primary/30";

		if (ratio < 0.5) return "bg-primary/45 border border-primary/50 hover:bg-primary/60";

		if (ratio < 0.75) return "bg-primary/75 border border-primary/80 hover:bg-primary/85";

		return "bg-primary border border-primary text-primary-foreground hover:bg-primary/90";
	};

	return (
		<Card className="col-span-1 border-border/70 bg-card/65 md:col-span-3 lg:col-span-6">
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<div>
					<div className="flex items-center gap-2">
						<Calendar className="size-4.5 text-primary" />
						<CardTitle className="font-bold text-base">{m.user_watch_habits_hours()}</CardTitle>
					</div>
					<CardDescription className="text-xs">{m.user_activity_heatmap_description()}</CardDescription>
				</div>

				{maxSlot > 0 && (
					<div className="flex items-center gap-1.5 rounded-lg border border-warning/30 bg-warning/10 px-2.5 py-1 text-[11px] text-warning">
						<Flame className="size-3.5 fill-current" />
						<span>{m.user_activity_peak({ day: peakDayName, hour: peakHour })}</span>
					</div>
				)}
			</CardHeader>
			<CardContent>
				<TooltipProvider delay={100}>
					<div className="overflow-x-auto pb-2">
						<div className="min-w-120">
							{/* Hours Header */}
							<div className="mb-1 grid grid-cols-[36px_repeat(24,1fr)] gap-1 text-center font-mono text-[10px] text-muted-foreground">
								<div />
								{HOURS.map((hour) => (
									<div key={hour} className="text-center">
										{hour % 3 === 0 ? `${hour}` : ""}
									</div>
								))}
							</div>

							{/* Grid Rows */}
							<div className="space-y-1">
								{DAYS_ORDER.map((day) => (
									<div key={day.index} className="grid grid-cols-[36px_repeat(24,1fr)] items-center gap-1">
										<span className="font-bold text-[11px] text-muted-foreground">{day.label}</span>
										{HOURS.map((hour) => {
											const key = `${day.index}-${hour}`;
											const minutes = dataMap.get(key) ?? 0;
											const hours = Math.floor(minutes / 60);
											const mins = minutes % 60;
											const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;

											return (
												<Tooltip key={hour}>
													<TooltipTrigger
														render={
															<button
																type="button"
																aria-label={`${day.fullName}, ${hour}:00–${hour}:59 — ${minutes > 0 ? timeStr : m.user_no_activity()}`}
																className={cn(
																	"aspect-square cursor-pointer rounded-xs p-0 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1",
																	getCellColor(minutes),
																)}
															/>
														}
													/>
													<TooltipContent side="top" className="text-xs">
														<p className="font-bold">{m.user_day_hour_range({ day: day.fullName, hour: hour })}</p>
														<p className="text-muted-foreground">{minutes > 0 ? timeStr : m.user_no_activity()}</p>
													</TooltipContent>
												</Tooltip>
											);
										})}
									</div>
								))}
							</div>

							{/* Legend */}
							<div className="mt-3 flex items-center justify-between border-border/40 border-t pt-3 text-[11px] text-muted-foreground">
								<div className="flex items-center gap-1.5">
									<Info className="size-3" />
									<span>{m.user_hover_for_time()}</span>
								</div>
								<div className="flex items-center gap-1.5 font-mono text-[10px]">
									<span>{m.common_less()}</span>
									<div className="size-2.5 rounded-xs border border-border/30 bg-muted/30" />
									<div className="size-2.5 rounded-xs bg-primary/25" />
									<div className="size-2.5 rounded-xs bg-primary/50" />
									<div className="size-2.5 rounded-xs bg-primary/80" />
									<div className="size-2.5 rounded-xs bg-primary" />
									<span>{m.components_app_navbar_more()}</span>
								</div>
							</div>
						</div>
					</div>
				</TooltipProvider>
			</CardContent>
		</Card>
	);
}
