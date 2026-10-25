import type { TopWatchedMedia } from "@reelvault/sdk";
import { cn } from "cn";
import { Award, CheckCircle2, Clock, Film, Play, Tv } from "lucide-react";
import { ApiImage } from "@/components/ui/api-image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { m } from "@/paraglide/messages";
import { extractFileIdFromUrl } from "@/utils/metadata-utils";

interface InsightsTopContentProps {
	topMovies: TopWatchedMedia[];
	topShows: TopWatchedMedia[];
}

export function InsightsTopContent({ topMovies, topShows }: InsightsTopContentProps) {
	return (
		<Card variant="subtle" className="col-span-1 md:col-span-6 lg:col-span-12">
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<div className="flex items-center gap-2">
						<Award className="text-warning size-5" />
						<CardTitle>{m.user_most_watched_titles()}</CardTitle>
					</div>
					<CardDescription size="xs">{m.user_top_titles_ranking()}</CardDescription>
				</div>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue="movies" className="w-full">
					<TabsList className="mb-4">
						<TabsTrigger value="movies">
							<Film className="size-3.5" />
							<span>{m.user_insights_movies_tab({ count: topMovies.length })}</span>
						</TabsTrigger>
						<TabsTrigger value="shows">
							<Tv className="size-3.5" />
							<span>{m.user_insights_shows_tab({ count: topShows.length })}</span>
						</TabsTrigger>
					</TabsList>

					<TabsContent value="movies">
						{topMovies.length === 0 ? (
							<div className="text-muted-foreground flex flex-col items-center justify-center py-12 text-center">
								<Film className="mb-2 size-8 opacity-40" />
								<p className="text-xs">{m.user_no_movies_in_period()}</p>
							</div>
						) : (
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
								{topMovies.map((item, index) => (
									<MediaRankCard key={item.id} item={item} rank={index + 1} />
								))}
							</div>
						)}
					</TabsContent>

					<TabsContent value="shows">
						{topShows.length === 0 ? (
							<div className="text-muted-foreground flex flex-col items-center justify-center py-12 text-center">
								<Tv className="mb-2 size-8 opacity-40" />
								<p className="text-xs">{m.user_no_series_in_period()}</p>
							</div>
						) : (
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
								{topShows.map((item, index) => (
									<MediaRankCard key={item.id} item={item} rank={index + 1} />
								))}
							</div>
						)}
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}

function MediaRankCard({ item, rank }: { item: TopWatchedMedia; rank: number }) {
	const hours = Math.floor(item.minutes / 60);
	const mins = item.minutes % 60;
	const formattedDuration = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

	return (
		<div className="group border-border/60 bg-background/50 hover:border-primary/50 relative flex flex-col overflow-hidden rounded-xl border transition-[border-color,background-color,color,box-shadow] hover:shadow-lg">
			{/* Poster Container */}
			<div className="bg-muted relative aspect-2/3 w-full overflow-hidden">
				<ApiImage
					fileId={extractFileIdFromUrl(item.posterUrl)}
					cacheKey={item.posterUpdatedAt}
					alt={item.title}
					fill
					sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
					zoom
					className="object-cover"
				/>
				<div className="from-background/90 absolute inset-0 bg-linear-to-t via-transparent to-black/30" />

				{/* Rank Badge */}
				<div className="absolute top-2 left-2">
					<div
						className={cn("flex size-7 items-center justify-center rounded-lg border text-xs font-black", {
							"border-warning/40 bg-warning/25 text-warning": rank === 1,
							"border-border/40 bg-muted/60 text-foreground/80": rank === 2,
							"border-warning/25 bg-warning/10 text-warning": rank === 3,
							"border-border/40 bg-muted/60 text-muted-foreground": rank <= 0 || rank >= 4,
						})}
					>
						{m.user_insights_rank({ index: rank })}
					</div>
				</div>

				{item.completed && (
					<div className="absolute top-2 right-2">
						<Badge weight="semibold" variant="success">
							<CheckCircle2 className="size-3" />
							{m.admin_worker_finished_word()}
						</Badge>
					</div>
				)}
			</div>

			{/* Info */}
			<div className="flex flex-1 flex-col justify-between p-3">
				<div>
					<p className="text-foreground truncate text-sm font-bold" title={item.title}>
						{item.title}
					</p>
					{item.releaseYear && <p className="text-muted-foreground font-mono text-xs">{item.releaseYear}</p>}
				</div>

				<div className="border-border/40 mt-3 flex items-center justify-between border-t pt-2 text-xs">
					<div className="text-primary flex items-center gap-1 font-semibold">
						<Clock className="size-3" />
						<span>{formattedDuration}</span>
					</div>
					<div className="text-muted-foreground flex items-center gap-1 text-xs">
						<Play className="size-3 fill-current opacity-60" />
						<span>
							{item.type === "tv_show"
								? m.user_insights_episode_plays({ count: item.watchCount })
								: m.user_insights_media_plays({ count: item.watchCount })}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
