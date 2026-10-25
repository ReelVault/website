import type { GenreDistribution } from "@reelvault/sdk";
import { PieChart, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { m } from "@/paraglide/messages";

interface InsightsGenresDistributionProps {
	genres: GenreDistribution[];
}

export function InsightsGenresDistribution({ genres }: InsightsGenresDistributionProps) {
	if (genres.length === 0) {
		return null;
	}

	return (
		<Card variant="subtle" className="col-span-1 md:col-span-3 lg:col-span-6">
			<CardHeader>
				<div className="flex items-center gap-2">
					<PieChart className="text-primary size-4.5" />
					<CardTitle>{m.user_genre_breakdown()}</CardTitle>
				</div>
				<CardDescription size="xs">{m.user_favorite_categories()}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{genres.map((genre, index) => {
					const hours = Math.floor(genre.minutes / 60);
					const mins = genre.minutes % 60;
					const formattedTime = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

					return (
						<div key={genre.name} className="space-y-1.5">
							<div className="flex items-center justify-between text-xs">
								<div className="text-foreground flex items-center gap-1.5 font-semibold">
									{index === 0 && <Sparkles className="text-warning size-3" />}
									<span>{genre.name}</span>
								</div>
								<div className="flex items-center gap-2 font-mono">
									<span className="text-muted-foreground">{formattedTime}</span>
									<span className="text-primary font-bold">{m.common_percent_value({ value: genre.percentage })}</span>
								</div>
							</div>
							<Progress value={genre.percentage} />
						</div>
					);
				})}
			</CardContent>
		</Card>
	);
}
