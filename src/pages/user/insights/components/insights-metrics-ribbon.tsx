import type { ProfileInsights } from "@reelvault/sdk";
import { Award, CheckCircle2, Zap } from "lucide-react";
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
				<Card variant="subtle">
					<CardContent size="comfortable" className="flex items-center gap-4">
						<div className="bg-success/10 text-success flex size-11 items-center justify-center rounded-xl">
							<CheckCircle2 className="size-5.5" />
						</div>
						<div>
							<p className="text-foreground text-2xl font-bold">{insight.completedTitlesCount}</p>
							<p className="text-muted-foreground text-xs font-semibold">{m.user_completed_sessions()}</p>
						</div>
					</CardContent>
				</Card>

				<Card variant="subtle">
					<CardContent size="comfortable" className="flex items-center gap-4">
						<div className="bg-warning/10 text-warning flex size-11 items-center justify-center rounded-xl">
							<Zap className="size-5.5" />
						</div>
						<div>
							<p className="text-foreground text-2xl font-bold">
								{m.common_duration_hours_minutes({
									hours: Math.floor(insight.longestSessionMinutes / 60),
									minutes: insight.longestSessionMinutes % 60,
								})}
							</p>
							<p className="text-muted-foreground text-xs font-semibold">{m.user_longest_single_session()}</p>
						</div>
					</CardContent>
				</Card>

				<Card variant="subtle">
					<CardContent size="comfortable" className="flex items-center gap-4">
						<div className="flex size-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
							<Award className="size-5.5" />
						</div>
						<div>
							<p className="text-foreground text-2xl font-bold">{insight.genresDistribution.length}</p>
							<p className="text-muted-foreground text-xs font-semibold">{m.user_different_genres()}</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</SimpleAnimation>
	);
}
