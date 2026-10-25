import { Link } from "@tanstack/react-router";
import type { useWatchedHistory } from "@/client/hooks/use-watched-history";
import { ApiImage } from "@/components/ui/api-image";
import { m } from "@/paraglide/messages";
import { formatDate } from "@/utils/format-utils";

export type HistoryItem = ReturnType<typeof useWatchedHistory>["history"][number];

export function HistoryCard({ item }: { item: HistoryItem }) {
	const title = item.metadata.title;

	return (
		<Link
			to="/details/$id"
			params={{ id: item.metadata.id }}
			className="group border-border/70 bg-card hover:border-primary/50 relative flex min-h-44 overflow-hidden rounded-2xl border transition-[border-color,transform] hover:-translate-y-0.5"
		>
			<div className="absolute inset-0">
				<ApiImage
					fileId={item.backdrop?.id}
					cacheKey={item.backdrop?.updatedAt}
					alt={title}
					width={384}
					aspectRatio={16 / 9}
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					zoom
					dim={55}
					className="object-cover"
				/>
				<div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
			</div>

			<div className="absolute inset-x-0 bottom-0 p-5">
				<h3 className="text-foreground truncate text-lg font-bold tracking-tight">{title}</h3>
				<div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
					<span className="text-primary text-xs font-medium">{formatDate(item.watchedAt)}</span>
					{item.episode && (
						<span className="text-foreground/70 text-xs font-medium">
							{m.user_history_season_episode({ season: item.season?.seasonNumber ?? "?", episode: item.episode.episodeNumber })}
						</span>
					)}
					{item.durationWatched && (
						<span className="text-muted-foreground text-xs font-medium">
							{m.user_history_watched_minutes({ minutes: Math.floor(item.durationWatched / 60) })}
						</span>
					)}
				</div>
			</div>
		</Link>
	);
}
