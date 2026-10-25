import { cn } from "cn";
import { BarChart2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { m } from "@/paraglide/messages";

interface ActivityItem {
	date: string;
	day: string;
	value: number;
}

interface InsightsActivityChartProps {
	weeklyActivity: ActivityItem[];
	maxActivity: number;
	selectedRange: string;
}

type BarColorClass = "bg-primary" | "bg-primary/75" | "bg-primary/45" | "bg-transparent";

const getBarColorClass = (height: number, value: number): BarColorClass => {
	if (height > 75) return "bg-primary";

	if (height > 35) return "bg-primary/75";

	if (value > 0) return "bg-primary/45";

	return "bg-transparent";
};

export function InsightsActivityChart({ weeklyActivity, maxActivity, selectedRange }: InsightsActivityChartProps) {
	const totalMinutes = weeklyActivity.reduce((acc, item) => acc + item.value, 0);
	const totalHours = Math.floor(totalMinutes / 60);
	const isLongRange = weeklyActivity.length > 10;

	return (
		<section className="border-border/70 bg-card/65 col-span-1 row-span-2 overflow-hidden rounded-2xl border p-6 md:col-span-6 lg:col-span-12">
			<div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
				{/* Chart Header */}
				<div className="flex shrink-0 flex-col gap-2">
					<div className="flex items-center gap-2">
						<div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
							<BarChart2 className="size-4" />
						</div>
						<span className="text-muted-foreground text-xs font-bold">{m.user_daily_activity()}</span>
					</div>

					<h2 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
						{m.user_watch_history()}
						<span className="text-primary ml-2 font-mono text-xs">{m.user_insights_selected_range({ range: selectedRange })}</span>
					</h2>

					<p className="text-muted-foreground text-xs font-medium">
						{m.user_insights_total_period()}{" "}
						<span className="text-foreground font-mono font-bold">
							{m.common_duration_hours_minutes({ hours: totalHours, minutes: totalMinutes % 60 })}
						</span>
					</p>
				</div>

				{/* Bars Container */}
				<TooltipProvider delay={50}>
					<div className="w-full min-w-0 flex-1 scrollbar-thin overflow-x-auto pb-2">
						<div className="flex h-44 min-w-[320px] items-end justify-end gap-1 pt-6 sm:gap-2">
							{weeklyActivity.map(({ date, day, value }, index) => {
								const height = maxActivity > 0 ? Math.round((value / maxActivity) * 100) : 0;
								const hours = Math.floor(value / 60);
								const mins = value % 60;
								const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;

								// Label display logic for clean axis
								const showLabel =
									!isLongRange ||
									weeklyActivity.length <= 14 ||
									index % Math.ceil(weeklyActivity.length / 10) === 0 ||
									index === weeklyActivity.length - 1;

								// Format short date label
								const dateParts = date.split("-");
								const shortLabel = isLongRange && dateParts[2] ? `${Number(dateParts[2])}.${Number(dateParts[1])}` : day;

								return (
									<Tooltip key={date}>
										<TooltipTrigger
											render={
												<div className="group relative flex h-full max-w-9 min-w-2 flex-1 cursor-pointer flex-col items-center justify-end">
													<div className="bg-muted/40 group-hover:bg-muted/80 relative h-32 w-full overflow-hidden rounded-md transition-colors sm:rounded-lg">
														<div
															className={cn(
																"absolute bottom-0 w-full rounded-md transition-[border-color,background-color,color,box-shadow] duration-300 group-hover:brightness-125",
																getBarColorClass(height, value),
															)}
															style={{
																height: `${Math.max(height, value > 0 ? 8 : 0)}%`,
															}}
														/>
													</div>

													<div className="flex h-5 items-center justify-center pt-1">
														{showLabel ? (
															<span className="text-muted-foreground group-hover:text-foreground truncate font-mono text-xs font-bold transition-colors">
																{shortLabel}
															</span>
														) : (
															<span className="text-muted-foreground/30 text-xs">{m.common_bullet_symbol()}</span>
														)}
													</div>
												</div>
											}
										/>
										<TooltipContent side="top">
											<p className="font-bold">{date}</p>
											<p className="text-muted-foreground">{value > 0 ? timeStr : m.user_no_activity()}</p>
										</TooltipContent>
									</Tooltip>
								);
							})}
						</div>
					</div>
				</TooltipProvider>
			</div>
		</section>
	);
}
