import { cn } from "cn";
import { Award, CheckCircle2, Clock, Film, Play, Tv } from "lucide-react";
import type { TopWatchedMedia } from "@reelvault/sdk";
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
		<Card className="col-span-1 border-border/70 bg-card/65 md:col-span-6 lg:col-span-12">
			<CardHeader className="flex flex-row items-center justify-between pb-4">
				<div>
					<div className="flex items-center gap-2">
						<Award className="size-5 text-warning" />
						<CardTitle className="font-bold text-lg">{m.user_most_watched_titles()}</CardTitle>
					</div>
					<CardDescription className="text-xs">{m.user_top_titles_ranking()}</CardDescription>
				</div>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue="movies" className="w-full">
					<TabsList className="mb-4">
						<TabsTrigger value="movies" className="gap-2 text-xs">
							<Film className="size-3.5" />
							<span>{m.user_insights_movies_tab({ count: topMovies.length })}</span>
						</TabsTrigger>
						<TabsTrigger value="shows" className="gap-2 text-xs">
							<Tv className="size-3.5" />
							<span>{m.user_insights_shows_tab({ count: topShows.length })}</span>
						</TabsTrigger>
					</TabsList>

					<TabsContent value="movies">
						{topMovies.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
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
							<div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
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
		<div className="group relative flex flex-col overflow-hidden rounded-xl border border-border/60 bg-background/50 transition-[border-color,background-color,color,box-shadow] hover:border-primary/50 hover:shadow-lg">
			{/* Poster Container */}
			<div className="relative aspect-2/3 w-full overflow-hidden bg-muted">
				<ApiImage
					fileId={extractFileIdFromUrl(item.posterUrl)}
					cacheKey={item.posterUpdatedAt}
					alt={item.title}
					fill
					sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
					className="object-cover transition-transform duration-300 group-hover:scale-105"
				/>
				<div className="absolute inset-0 bg-linear-to-t from-background/90 via-transparent to-black/30" />

				{/* Rank Badge */}
				<div className="absolute top-2 left-2">
					<div
						className={cn("flex size-7 items-center justify-center rounded-lg border font-black text-xs", {
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
						<Badge
							variant="secondary"
							className="gap-1 border-success/30 bg-success/20 px-1.5 py-0.5 font-semibold text-[10px] text-success"
						>
							<CheckCircle2 className="size-3" />
							{m.admin_worker_finished_word()}
						</Badge>
					</div>
				)}
			</div>

			{/* Info */}
			<div className="flex flex-1 flex-col justify-between p-3">
				<div>
					<p className="truncate font-bold text-foreground text-sm" title={item.title}>
						{item.title}
					</p>
					{item.releaseYear && <p className="font-mono text-muted-foreground text-xs">{item.releaseYear}</p>}
				</div>

				<div className="mt-3 flex items-center justify-between border-border/40 border-t pt-2 text-xs">
					<div className="flex items-center gap-1 font-semibold text-primary">
						<Clock className="size-3" />
						<span>{formattedDuration}</span>
					</div>
					<div className="flex items-center gap-1 text-muted-foreground text-xs">
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
