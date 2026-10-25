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
					<h3 className="text-foreground group-hover:text-primary line-clamp-1 text-lg font-bold transition-colors md:text-xl">
						<span className="text-muted-foreground/60 mr-2">{numberLabel}</span>
						{episode.title ?? m.web_episode_number_short({ number: episode.episodeNumber })}
					</h3>
					<div className="flex flex-wrap items-center gap-2">
						{episode.episodeType === "special" && <Badge variant="secondary">{m.web_episode_special()}</Badge>}
						{hasMultipleVersions && (
							<Badge variant="primary" title={m.web_episode_has_versions({ count: filesLength })}>
								<Layers className="size-3" />
								{m.details_versions_count({ fileCount: filesLength })}
							</Badge>
						)}
						{isWatched ? (
							<Badge variant="success">
								<Check className="mr-1 size-3" />
								{m.common_watched_badge()}
							</Badge>
						) : (
							episodePlayback?.status === "in_progress" && (
								<Badge variant="primary">
									<Clock className="mr-1 size-3" />
									{m.common_percent_value({
										value: getProgressPercent(episodePlayback.progress?.position, episodePlayback.progress?.duration),
									})}
								</Badge>
							)
						)}
					</div>
				</div>

				<div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
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
						<span className="bg-muted/60 text-foreground/80 rounded px-2 py-0.5 font-mono text-xs">{defaultFile.qualityTag}</span>
					)}
				</div>
			</div>
			{episodePlayback?.status === "in_progress" && (
				<div className="bg-muted h-1 overflow-hidden rounded-full">
					<div
						className="bg-primary h-full"
						style={{
							width: `${getProgressPercent(episodePlayback.progress?.position, episodePlayback.progress?.duration)}%`,
						}}
					/>
				</div>
			)}
			<p className="text-muted-foreground/90 line-clamp-3 text-sm leading-relaxed">{episode.overview ?? m.web_no_episode_description()}</p>
		</div>
	);
}
