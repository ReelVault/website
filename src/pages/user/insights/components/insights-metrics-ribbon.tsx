import { Award, CheckCircle2, Zap } from "lucide-react";
import type { ProfileInsights } from "reelvault-sdk";
import { SimpleAnimation } from "@/components/simple-animation";
import { Card, CardContent } from "@/components/ui/card";
import { m } from "@/paraglide/messages";

interface InsightsMetricsRibbonProps {
	insight: ProfileInsights;
}

export function InsightsMetricsRibbon({ insight }: InsightsMetricsRibbonProps) {
	return (
		<SimpleAnimation direction="up" delay={50} duration={260}>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<Card className="border-border/60 bg-card/40">
					<CardContent className="flex items-center gap-4 p-5">
						<div className="flex size-11 items-center justify-center rounded-xl bg-success/10 text-success">
							<CheckCircle2 className="size-5.5" />
						</div>
						<div>
							<p className="font-bold text-2xl text-foreground">{insight.completedTitlesCount}</p>
							<p className="font-semibold text-muted-foreground text-xs">{m.user_completed_sessions()}</p>
						</div>
					</CardContent>
				</Card>

				<Card className="border-border/60 bg-card/40">
					<CardContent className="flex items-center gap-4 p-5">
						<div className="flex size-11 items-center justify-center rounded-xl bg-warning/10 text-warning">
							<Zap className="size-5.5" />
						</div>
						<div>
							<p className="font-bold text-2xl text-foreground">
								{m.common_duration_hours_minutes({
									hours: Math.floor(insight.longestSessionMinutes / 60),
									minutes: insight.longestSessionMinutes % 60,
								})}
							</p>
							<p className="font-semibold text-muted-foreground text-xs">{m.user_longest_single_session()}</p>
						</div>
					</CardContent>
				</Card>

				<Card className="border-border/60 bg-card/40">
					<CardContent className="flex items-center gap-4 p-5">
						<div className="flex size-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
							<Award className="size-5.5" />
						</div>
						<div>
							<p className="font-bold text-2xl text-foreground">{insight.genresDistribution.length}</p>
							<p className="font-semibold text-muted-foreground text-xs">{m.user_different_genres()}</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</SimpleAnimation>
	);
}
