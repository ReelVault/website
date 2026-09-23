import { Flame } from "lucide-react";
import type { AdminAnalytics } from "@reelvault/sdk";
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
		<Card className="col-span-1 border-border/70 bg-card/50 lg:col-span-5">
			<CardHeader>
				<div className="flex items-center gap-2">
					<Flame className="size-5 text-primary" />
					<CardTitle className="font-bold text-base">{m.admin_analytics_top_productions()}</CardTitle>
				</div>
				<CardDescription className="text-xs">{m.admin_analytics_top_viewership_description()}</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				{topContent.length === 0 ? (
					<p className="py-8 text-center text-muted-foreground text-xs">{m.admin_analytics_no_data_dot()}</p>
				) : (
					topContent.slice(0, 5).map((item, index) => {
						const h = Math.floor(item.minutes / 60);
						const mins = item.minutes % 60;
						const timeStr = m.common_duration_hours_minutes({ hours: h, minutes: mins });

						return (
							<div
								key={item.id}
								className="flex items-center gap-3 rounded-xl border border-border/40 bg-background/50 p-2.5 transition-[border-color,background-color,color,box-shadow] hover:border-border"
							>
								<span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted font-bold font-mono text-xs">
									{m.common_rank_number({ index: index + 1 })}
								</span>

								<div className="relative aspect-2/3 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
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
									<p className="truncate font-semibold text-foreground text-xs" title={item.title}>
										{item.title}
									</p>
									<div className="flex items-center gap-2 text-[10px] text-muted-foreground">
										<Badge variant="outline" className="px-1 py-0 text-[9px] uppercase">
											{item.type === "movie" ? m.common_movie_word() : m.common_series_word()}
										</Badge>
										<span>{m.admin_analytics_item_play_count({ watchCount: item.watchCount })}</span>
									</div>
								</div>

								<div className="shrink-0 text-right font-bold font-mono text-primary text-xs">{timeStr}</div>
							</div>
						);
					})
				)}
			</CardContent>
		</Card>
	);
}
