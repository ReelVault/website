import type { AdminAnalytics } from "@reelvault/sdk";
import { Flame } from "lucide-react";
import { ApiImage } from "@/components/ui/api-image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { m } from "@/paraglide/messages";
import { extractFileIdFromUrl } from "@/utils/metadata-utils";

interface AnalyticsTopContentProps {
	topContent: AdminAnalytics["topContent"];
}

export function AnalyticsTopContent({ topContent }: AnalyticsTopContentProps) {
	return (
		<Card variant="subtle" className="col-span-1 lg:col-span-5">
			<CardHeader>
				<div className="flex items-center gap-2">
					<Flame className="text-primary size-5" />
					<CardTitle>{m.admin_analytics_top_productions()}</CardTitle>
				</div>
				<CardDescription size="xs">{m.admin_analytics_top_viewership_description()}</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				{topContent.length === 0 ? (
					<p className="text-muted-foreground py-8 text-center text-xs">{m.admin_analytics_no_data_dot()}</p>
				) : (
					topContent.slice(0, 5).map((item, index) => {
						const h = Math.floor(item.minutes / 60);
						const mins = item.minutes % 60;
						const timeStr = m.common_duration_hours_minutes({ hours: h, minutes: mins });

						return (
							<div
								key={item.id}
								className="border-border/40 bg-background/50 hover:border-border flex items-center gap-3 rounded-xl border p-2.5 transition-[border-color,background-color,color,box-shadow]"
							>
								<span className="bg-muted flex size-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-bold">
									{m.common_rank_number({ index: index + 1 })}
								</span>

								<div className="bg-muted relative aspect-2/3 w-10 shrink-0 overflow-hidden rounded-md">
									<ApiImage
										fileId={extractFileIdFromUrl(item.posterUrl)}
										cacheKey={item.posterUpdatedAt}
										alt={item.title}
										fill
										sizes="40px"
										className="object-cover"
									/>
								</div>

								<div className="min-w-0 flex-1">
									<p className="text-foreground truncate text-xs font-semibold" title={item.title}>
										{item.title}
									</p>
									<div className="text-muted-foreground flex items-center gap-2 text-xs">
										<Badge variant="outline">{item.type === "movie" ? m.common_movie_word() : m.common_series_word()}</Badge>
										<span>{m.admin_analytics_item_play_count({ watchCount: item.watchCount })}</span>
									</div>
								</div>

								<div className="text-primary shrink-0 text-right font-mono text-xs font-bold">{timeStr}</div>
							</div>
						);
					})
				)}
			</CardContent>
		</Card>
	);
}
