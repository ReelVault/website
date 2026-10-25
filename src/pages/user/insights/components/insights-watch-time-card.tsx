import { cn } from "cn";
import { ArrowDown, ArrowUp, Clock } from "lucide-react";
import { m } from "@/paraglide/messages";

interface InsightsWatchTimeCardProps {
	totalWatchTime: { days: number; hours: number };
	monthlyIncrease: { value: number; trend: "up" | "down" };
	dailyAverage: string;
}

export function InsightsWatchTimeCard({ totalWatchTime, monthlyIncrease, dailyAverage }: InsightsWatchTimeCardProps) {
	return (
		<div className="border-border/70 bg-card/65 relative col-span-1 row-span-2 flex flex-col justify-between overflow-hidden rounded-2xl border p-6 md:col-span-4 lg:col-span-8">
			<div className="relative z-20">
				<div className="mb-8 flex items-center gap-3">
					<div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-2xl">
						<Clock className="size-5" />
					</div>
					<p className="text-muted-foreground text-xs font-bold">{m.admin_analytics_watch_time()}</p>
				</div>

				<h2 className="text-foreground text-6xl font-black tracking-tight md:text-7xl">
					{totalWatchTime.days}
					<span className="text-primary mx-2 text-2xl font-medium opacity-60">{m.common_days()}</span>
					{totalWatchTime.hours}
					<span className="text-primary ml-2 text-2xl font-medium opacity-60">{m.common_hours_short()}</span>
				</h2>
			</div>

			<div className="border-border relative z-20 mt-6 flex flex-wrap gap-10 border-t pt-8">
				<div>
					<p className="text-muted-foreground mb-1 text-xs font-bold">{m.user_change_vs_previous_period()}</p>
					<div
						className={cn(
							"flex items-center gap-2 text-2xl font-black",
							monthlyIncrease.trend === "up" ? "text-success" : "text-destructive",
						)}
					>
						{monthlyIncrease.trend === "up" ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />}
						<span>{m.user_insights_change_hours({ value: monthlyIncrease.value })}</span>
					</div>
				</div>
				<div>
					<p className="text-muted-foreground mb-1 text-xs font-bold">{m.user_daily_average()}</p>
					<p className="text-foreground text-2xl font-bold">{dailyAverage}</p>
				</div>
			</div>

			<div className="absolute top-6 right-6">
				<div
					className={cn(
						"flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold",
						monthlyIncrease.trend === "up" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
					)}
				>
					{monthlyIncrease.trend === "up" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
					{m.user_insights_change_hours({ value: monthlyIncrease.value })}
				</div>
			</div>

			<div className="pointer-events-none absolute inset-0 z-10 opacity-30">
				<svg className="h-full w-full" viewBox="0 0 800 200" preserveAspectRatio="none" aria-hidden="true">
					<defs>
						<linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
							<stop offset="0%" style={{ stopColor: "var(--primary)", stopOpacity: 0.2 }} />
							<stop offset="100%" style={{ stopColor: "transparent", stopOpacity: 0 }} />
						</linearGradient>
					</defs>
					<path d="M0,150 Q100,80 200,120 T400,100 T600,140 T800,90 L800,200 L0,200 Z" fill="url(#grad)" />
					<path
						d="M0,150 Q100,80 200,120 T400,100 T600,140 T800,90"
						fill="none"
						stroke="var(--primary)"
						strokeWidth="4"
						strokeLinecap="round"
						strokeDasharray="10 5"
						className="opacity-50"
					/>
				</svg>
			</div>
		</div>
	);
}
