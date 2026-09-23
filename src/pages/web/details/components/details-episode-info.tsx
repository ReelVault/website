import { Calendar, Check, Clock, Layers } from "lucide-react";
import type { useEpisodes } from "@/client/hooks/use-episodes";
import { Badge } from "@/components/ui/badge";
import { m } from "@/paraglide/messages";
import { formatDuration } from "@/utils/duration-utils";
import { shortDateFormatter } from "@/utils/format-utils";
import { getProgressPercent } from "./details-episode-utils";

type EpisodeItem = NonNullable<ReturnType<typeof useEpisodes>["data"]>["data"][number];

interface DetailsEpisodeInfoProps {
	episode: EpisodeItem;
	filesLength: number;
	defaultFile?: { duration?: number | null; qualityTag?: string | null };
	isWatched: boolean;
	episodePlayback?: {
		status?: string;
		progress?: { position?: number; duration?: number } | null;
	};
}

export function DetailsEpisodeInfo({ episode, filesLength, defaultFile, isWatched, episodePlayback }: DetailsEpisodeInfoProps) {
	const hasMultipleVersions = filesLength > 1;
	const numberLabel = episode.absoluteNumber !== null ? `#${episode.absoluteNumber}.` : `${episode.episodeNumber}.`;

	return (
		<div className="flex flex-1 flex-col gap-3">
			<div className="flex flex-col gap-2">
				<div className="flex flex-wrap items-center gap-2">
					<h3 className="line-clamp-1 font-bold text-foreground text-lg transition-colors group-hover:text-primary md:text-xl">
						<span className="mr-2 text-muted-foreground/60">{numberLabel}</span>
						{episode.title ?? m.web_episode_number_short({ number: episode.episodeNumber })}
					</h3>
					<div className="flex flex-wrap items-center gap-2">
						{episode.episodeType === "special" && <Badge variant="secondary">{m.web_episode_special()}</Badge>}
						{hasMultipleVersions && (
							<Badge
								variant="outline"
								className="gap-1 border-primary/40 bg-primary/10 font-medium text-primary"
								title={m.web_episode_has_versions({ count: filesLength })}
							>
								<Layers className="size-3" />
								{m.details_versions_count({ fileCount: filesLength })}
							</Badge>
						)}
						{isWatched ? (
							<Badge variant="outline" className="border-success/30 bg-success/10 text-success">
								<Check className="mr-1 size-3" />
								{m.common_watched_badge()}
							</Badge>
						) : (
							episodePlayback?.status === "in_progress" && (
								<Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
									<Clock className="mr-1 size-3" />
									{m.common_percent_value({
										value: getProgressPercent(episodePlayback.progress?.position, episodePlayback.progress?.duration),
									})}
								</Badge>
							)
						)}
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
					{episode.airDate && (
						<div className="flex items-center gap-1.5">
							<Calendar className="size-3.5" />
							<span>{shortDateFormatter.format(new Date(episode.airDate))}</span>
						</div>
					)}
					<div className="flex items-center gap-1.5">
						<Clock className="size-3.5" />
						<span className="text-muted-foreground/60">
							{defaultFile?.duration ? formatDuration(defaultFile.duration) : m.common_not_available()}
						</span>
					</div>
					{defaultFile?.qualityTag && (
						<span className="rounded bg-muted/60 px-2 py-0.5 font-mono text-foreground/80 text-xs">{defaultFile.qualityTag}</span>
					)}
				</div>
			</div>
			{episodePlayback?.status === "in_progress" && (
				<div className="h-1 overflow-hidden rounded-full bg-muted">
					<div
						className="h-full bg-primary"
						style={{
							width: `${getProgressPercent(episodePlayback.progress?.position, episodePlayback.progress?.duration)}%`,
						}}
					/>
				</div>
			)}
			<p className="line-clamp-3 text-muted-foreground/90 text-sm leading-relaxed">{episode.overview ?? m.web_no_episode_description()}</p>
		</div>
	);
}
