import { cn } from "cn";
import type { useEpisodes } from "@/client/hooks/use-episodes";
import { LazyRender } from "@/components/lazy-render";
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import { m } from "@/paraglide/messages";
import { DetailsEpisodeContextMenu } from "./details-episode-context-menu";
import { DetailsEpisodeInfo } from "./details-episode-info";
import { DetailsEpisodePlayAction } from "./details-episode-play-action";
import { DetailsEpisodeThumbnail } from "./details-episode-thumbnail";

type EpisodeItem = NonNullable<ReturnType<typeof useEpisodes>["data"]>["data"][number];

interface DetailsEpisodeCardProps {
	episode: EpisodeItem;
	isHighlighted: boolean;
	episodePlayback?: {
		status?: string;
		progress?: { position?: number; duration?: number } | null;
	};
	isAdmin?: boolean;
	isEpisodeMarking: boolean;
	isEpisodeUnmarking: boolean;
	isEpisodeResetting: boolean;
	onNavigateToPlayer: (mediaFileId: string | undefined) => void;
	onToggleWatched: (mediaFileId: string, isWatched: boolean, duration?: number) => void;
	onResetProgress: (mediaFileId: string) => void;
	onSelectForFiles: (ep: { id: string; number: number; title?: string | null }) => void;
	onRefreshEpisode?: (id: string) => void;
	onRefreshImage?: (id: string) => void;
	onRegisterRef?: (el: HTMLDivElement | null) => void;
}

export function DetailsEpisodeCard({
	episode,
	isHighlighted,
	episodePlayback,
	isAdmin,
	isEpisodeMarking,
	isEpisodeUnmarking,
	isEpisodeResetting,
	onNavigateToPlayer,
	onToggleWatched,
	onResetProgress,
	onSelectForFiles,
	onRefreshEpisode,
	onRefreshImage,
	onRegisterRef,
}: DetailsEpisodeCardProps) {
	const files = episode.mediaFiles;
	const defaultFile = files.find((f) => f.isDefault) ?? files[0];
	const mediaFileId = defaultFile?.id;
	const numberLabel = episode.absoluteNumber !== null ? `#${episode.absoluteNumber}` : `${episode.episodeNumber}`;
	const episodeTitle = `${numberLabel}. ${episode.title ?? m.details_episode_fallback({ number: String(episode.episodeNumber) })}`;
	const isWatched = episodePlayback?.status === "watched";
	const hasProgress = episodePlayback?.status === "in_progress" || (episodePlayback?.progress?.position ?? 0) > 0;
	const isEpisodePending = isEpisodeMarking || isEpisodeUnmarking || isEpisodeResetting;

	const handleToggle = () => {
		if (!mediaFileId || isEpisodePending) return;

		onToggleWatched(mediaFileId, isWatched, defaultFile.duration ?? undefined);
	};

	const handleReset = () => {
		if (!mediaFileId || isEpisodePending) return;

		onResetProgress(mediaFileId);
	};

	return (
		<LazyRender minHeight={160} rootMargin="250px 0px">
			{() => (
				<ContextMenu>
					<ContextMenuTrigger
						ref={onRegisterRef}
						tabIndex={0}
						data-spatial
						onKeyDown={(event) => {
							if (event.key === "Enter" && mediaFileId) {
								event.preventDefault();
								onNavigateToPlayer(mediaFileId);
							}
						}}
						className={cn(
							"group relative block overflow-hidden rounded-xl border p-4 transition-[background-color,border-color,box-shadow] hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 md:p-6",
							isHighlighted ? "border-primary/60 bg-primary/5 shadow-lg shadow-primary/10" : "border-border/50",
						)}
					>
						<div className="flex flex-col gap-6 md:flex-row md:items-start">
							<DetailsEpisodeThumbnail
								imageId={episode.imageId}
								episodeTitle={episodeTitle}
								mediaFileId={mediaFileId}
								isWatched={isWatched}
								hasProgress={hasProgress}
								isEpisodePending={isEpisodePending}
								isEpisodeMarking={isEpisodeMarking}
								isEpisodeUnmarking={isEpisodeUnmarking}
								isEpisodeResetting={isEpisodeResetting}
								onToggleWatched={handleToggle}
								onResetProgress={handleReset}
							/>

							<DetailsEpisodeInfo
								episode={episode}
								filesLength={files.length}
								defaultFile={defaultFile}
								isWatched={isWatched}
								episodePlayback={episodePlayback}
							/>

							<div className="shrink-0 self-center pt-2 md:pt-0 md:pl-4">
								<DetailsEpisodePlayAction
									files={files}
									defaultFile={defaultFile}
									mediaFileId={mediaFileId}
									episodeNumber={episode.episodeNumber}
									episodeTitle={episode.title}
									onSelectForFiles={onSelectForFiles}
									episodeId={episode.id}
								/>
							</div>
						</div>
						<div className="absolute inset-y-0 left-0 w-1 bg-linear-to-b from-primary to-primary/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
					</ContextMenuTrigger>

					<DetailsEpisodeContextMenu
						episodeId={episode.id}
						episodeNumber={episode.episodeNumber}
						episodeTitle={episodeTitle}
						files={files}
						mediaFileId={mediaFileId}
						isWatched={isWatched}
						hasProgress={hasProgress}
						isEpisodePending={isEpisodePending}
						isAdmin={isAdmin}
						onToggleWatched={handleToggle}
						onResetProgress={handleReset}
						onSelectForFiles={onSelectForFiles}
						onRefreshEpisode={onRefreshEpisode}
						onRefreshImage={onRefreshImage}
					/>
				</ContextMenu>
			)}
		</LazyRender>
	);
}
