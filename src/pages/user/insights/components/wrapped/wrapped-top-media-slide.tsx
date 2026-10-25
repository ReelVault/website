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
				<Badge weight="bold" variant="primary" className="mb-2">
					{m.user_productions_of_year()}
				</Badge>
				<h3 className="text-foreground text-2xl font-black sm:text-4xl">{m.user_number_one_titles()}</h3>
				<p className="text-muted-foreground mt-1 text-sm">{m.user_unforgettable_titles()}</p>
			</div>

			<div className="grid grid-cols-1 gap-6 pt-2 sm:grid-cols-2">
				{data.topMovie ? (
					<div className="group via-card/80 to-background relative flex flex-col items-center gap-5 overflow-hidden rounded-2xl border border-amber-500/40 bg-linear-to-br from-amber-500/10 p-5 shadow-lg sm:flex-row">
						<div className="bg-muted relative aspect-2/3 w-32 shrink-0 overflow-hidden rounded-xl shadow-md">
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
							<Badge weight="bold" variant="warning">
								{m.user_no1_movie_of_year()}
							</Badge>
							<h4 className="text-foreground truncate text-lg font-bold sm:text-xl" title={data.topMovie.title}>
								{data.topMovie.title}
							</h4>
							{data.topMovie.releaseYear && <p className="text-muted-foreground font-mono text-xs">{data.topMovie.releaseYear}</p>}
							<div className="flex items-center justify-center gap-3 pt-2 text-xs sm:justify-start">
								<span className="text-primary text-sm font-bold">
									{m.common_duration_hours_minutes({ hours: Math.floor(data.topMovie.minutes / 60), minutes: data.topMovie.minutes % 60 })}
								</span>
								<span className="text-muted-foreground">{m.user_top_movie_play_count({ watchCount: data.topMovie.watchCount })}</span>
							</div>
						</div>
					</div>
				) : (
					<div className="border-border/60 bg-card/40 text-muted-foreground flex flex-col items-center justify-center rounded-2xl border p-8 text-center">
						<Film className="mb-2 size-10 opacity-30" />
						<p className="text-xs">{m.user_no_movies_this_year()}</p>
					</div>
				)}

				{data.topShow ? (
					<div className="group via-card/80 to-background relative flex flex-col items-center gap-5 overflow-hidden rounded-2xl border border-purple-500/40 bg-linear-to-br from-purple-500/10 p-5 shadow-lg sm:flex-row">
						<div className="bg-muted relative aspect-2/3 w-32 shrink-0 overflow-hidden rounded-xl shadow-md">
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
							<Badge weight="bold" variant="primary">
								{m.user_no1_series_of_year()}
							</Badge>
							<h4 className="text-foreground truncate text-lg font-bold sm:text-xl" title={data.topShow.title}>
								{data.topShow.title}
							</h4>
							{data.topShow.releaseYear && <p className="text-muted-foreground font-mono text-xs">{data.topShow.releaseYear}</p>}
							<div className="flex items-center justify-center gap-3 pt-2 text-xs sm:justify-start">
								<span className="text-primary text-sm font-bold">
									{m.common_duration_hours_minutes({ hours: Math.floor(data.topShow.minutes / 60), minutes: data.topShow.minutes % 60 })}
								</span>
								<span className="text-muted-foreground">{m.user_top_show_episode_count({ episodeCount: data.topShow.watchCount })}</span>
							</div>
						</div>
					</div>
				) : (
					<div className="border-border/60 bg-card/40 text-muted-foreground flex flex-col items-center justify-center rounded-2xl border p-8 text-center">
						<Tv className="mb-2 size-10 opacity-30" />
						<p className="text-xs">{m.user_no_series_this_year()}</p>
					</div>
				)}
			</div>
		</div>
	);
}
