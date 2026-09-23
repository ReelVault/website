import type { WrappedInsights } from "@reelvault/sdk";
import { Film, Tv } from "lucide-react";
import { ApiImage } from "@/components/ui/api-image";
import { Badge } from "@/components/ui/badge";
import { m } from "@/paraglide/messages";
import { extractFileIdFromUrl } from "@/utils/metadata-utils";

interface WrappedTopMediaSlideProps {
	data: WrappedInsights;
}

export function WrappedTopMediaSlide({ data }: WrappedTopMediaSlideProps) {
	return (
		<div className="fade-in zoom-in-95 animate-in space-y-6 py-2 duration-300">
			<div className="text-center">
				<Badge
					variant="outline"
					className="mb-2 border-primary/50 bg-primary/10 px-3 py-1 font-bold text-primary text-xs uppercase tracking-wider"
				>
					{m.user_productions_of_year()}
				</Badge>
				<h3 className="font-black text-2xl text-foreground sm:text-4xl">{m.user_number_one_titles()}</h3>
				<p className="mt-1 text-muted-foreground text-sm">{m.user_unforgettable_titles()}</p>
			</div>

			<div className="grid grid-cols-1 gap-6 pt-2 sm:grid-cols-2">
				{data.topMovie ? (
					<div className="group relative flex flex-col items-center gap-5 overflow-hidden rounded-2xl border border-amber-500/40 bg-linear-to-br from-amber-500/10 via-card/80 to-background p-5 shadow-lg sm:flex-row">
						<div className="relative aspect-2/3 w-32 shrink-0 overflow-hidden rounded-xl bg-muted shadow-md">
							<ApiImage
								fileId={extractFileIdFromUrl(data.topMovie.posterUrl)}
								cacheKey={data.topMovie.posterUpdatedAt}
								alt={data.topMovie.title}
								fill
								sizes="128px"
								className="object-cover"
							/>
						</div>
						<div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
							<Badge className="bg-amber-500/20 font-bold text-amber-400 text-xs">{m.user_no1_movie_of_year()}</Badge>
							<h4 className="truncate font-bold text-foreground text-lg sm:text-xl" title={data.topMovie.title}>
								{data.topMovie.title}
							</h4>
							{data.topMovie.releaseYear && <p className="font-mono text-muted-foreground text-xs">{data.topMovie.releaseYear}</p>}
							<div className="flex items-center justify-center gap-3 pt-2 text-xs sm:justify-start">
								<span className="font-bold text-primary text-sm">
									{m.common_duration_hours_minutes({ hours: Math.floor(data.topMovie.minutes / 60), minutes: data.topMovie.minutes % 60 })}
								</span>
								<span className="text-muted-foreground">{m.user_top_movie_play_count({ watchCount: data.topMovie.watchCount })}</span>
							</div>
						</div>
					</div>
				) : (
					<div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card/40 p-8 text-center text-muted-foreground">
						<Film className="mb-2 size-10 opacity-30" />
						<p className="text-xs">{m.user_no_movies_this_year()}</p>
					</div>
				)}

				{data.topShow ? (
					<div className="group relative flex flex-col items-center gap-5 overflow-hidden rounded-2xl border border-purple-500/40 bg-linear-to-br from-purple-500/10 via-card/80 to-background p-5 shadow-lg sm:flex-row">
						<div className="relative aspect-2/3 w-32 shrink-0 overflow-hidden rounded-xl bg-muted shadow-md">
							<ApiImage
								fileId={extractFileIdFromUrl(data.topShow.posterUrl)}
								cacheKey={data.topShow.posterUpdatedAt}
								alt={data.topShow.title}
								fill
								sizes="128px"
								className="object-cover"
							/>
						</div>
						<div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
							<Badge className="bg-purple-500/20 font-bold text-purple-400 text-xs">{m.user_no1_series_of_year()}</Badge>
							<h4 className="truncate font-bold text-foreground text-lg sm:text-xl" title={data.topShow.title}>
								{data.topShow.title}
							</h4>
							{data.topShow.releaseYear && <p className="font-mono text-muted-foreground text-xs">{data.topShow.releaseYear}</p>}
							<div className="flex items-center justify-center gap-3 pt-2 text-xs sm:justify-start">
								<span className="font-bold text-primary text-sm">
									{m.common_duration_hours_minutes({ hours: Math.floor(data.topShow.minutes / 60), minutes: data.topShow.minutes % 60 })}
								</span>
								<span className="text-muted-foreground">{m.user_top_show_episode_count({ episodeCount: data.topShow.watchCount })}</span>
							</div>
						</div>
					</div>
				) : (
					<div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card/40 p-8 text-center text-muted-foreground">
						<Tv className="mb-2 size-10 opacity-30" />
						<p className="text-xs">{m.user_no_series_this_year()}</p>
					</div>
				)}
			</div>
		</div>
	);
}
