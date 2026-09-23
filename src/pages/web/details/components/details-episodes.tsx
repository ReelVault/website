import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useEpisodesInfinite, useRefreshEpisode, useRefreshEpisodeImage } from "@/client/hooks/use-episodes";
import { usePlaybackMutations } from "@/client/hooks/use-me-playback";
import { AppEmptyState, AppErrorState } from "@/components/app-states";
import { MediaFilesDetailsDialog } from "@/components/media-files-details-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { DetailsEpisodeCard } from "./details-episode-card";
import { DetailsEpisodesSkeleton } from "./details-episodes-skeleton";

export function DetailsEpisodes({
	metadataId,
	seasonId,
	highlightEpisodeNumber,
	playback,
	isAdmin,
}: {
	metadataId: string;
	seasonId: string | null;
	highlightEpisodeNumber?: number;
	playback?: {
		totalEpisodes?: number;
		completedEpisodes?: number;
		episodes?: Record<string, { status?: string; progress?: { position?: number; duration?: number } | null }>;
	};
	isAdmin?: boolean;
}) {
	const navigate = useNavigate();
	const navigateToPlayer = (mediaFileId: string | undefined) => {
		if (mediaFileId) detach(navigate({ to: "/player/$id", params: { id: mediaFileId } }));
	};
	const [selectedEpisodeForFiles, setSelectedEpisodeForFiles] = useState<{
		id: string;
		number: number;
		title?: string | null;
	} | null>(null);
	const episodeRefs = useRef<Map<number, HTMLDivElement>>(new Map());

	const {
		data: response,
		isFetching,
		isPending,
		isError,
		error,
		refetch,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useEpisodesInfinite(seasonId);
	const episodes = response?.pages.flatMap((page) => page.data) ?? [];
	const refreshEpisodeMutation = useRefreshEpisode(metadataId);
	const refreshEpisodeImageMutation = useRefreshEpisodeImage(metadataId);
	const {
		resetProgress,
		isResetting,
		resettingMediaFileId,
		markAsWatched,
		isMarkingWatched,
		markingMediaFileId,
		unmarkWatched,
		isUnmarkingWatched,
		unmarkingMediaFileId,
	} = usePlaybackMutations(metadataId);

	const { ref: loadMoreRef, inView } = useInView({
		rootMargin: "200px",
	});

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			detach(fetchNextPage());
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

	// Fetch next pages if highlighted episode is not yet loaded
	const highlightedEpisodeLoaded = episodes.some((e) => e.episodeNumber === highlightEpisodeNumber);
	useEffect(() => {
		if (highlightEpisodeNumber !== undefined && hasNextPage && !isFetchingNextPage && !highlightedEpisodeLoaded) {
			detach(fetchNextPage());
		}
	}, [highlightEpisodeNumber, hasNextPage, isFetchingNextPage, highlightedEpisodeLoaded, fetchNextPage]);

	// Drop stale episode refs whenever the season changes.
	const lastSeasonRef = useRef<string | null>(null);
	useEffect(() => {
		if (lastSeasonRef.current !== seasonId) {
			lastSeasonRef.current = seasonId;
			episodeRefs.current.clear();
		}
	}, [seasonId]);

	// Scroll to highlighted episode from URL
	useEffect(() => {
		const timer =
			highlightEpisodeNumber !== undefined && !isPending && episodes.length > 0
				? window.setTimeout(() => {
						const el = episodeRefs.current.get(highlightEpisodeNumber);
						el?.scrollIntoView({ behavior: "smooth", block: "center" });
					}, 150)
				: 0;

		return () => {
			window.clearTimeout(timer);
		};
	}, [highlightEpisodeNumber, isPending, episodes.length]);

	if (isPending) {
		return <DetailsEpisodesSkeleton />;
	}

	if (isError) {
		return (
			<AppErrorState
				title={m.web_episodes_fetch_failed()}
				description={m.web_check_connection()}
				error={error}
				onRetry={() => detach(refetch())}
			/>
		);
	}

	if (episodes.length === 0) {
		return <AppEmptyState title={m.web_no_episodes_in_season()} />;
	}

	const handleToggleWatched = (mediaFileId: string, isWatched: boolean, duration?: number) => {
		if (isWatched) {
			detach(unmarkWatched(mediaFileId));
		} else {
			detach(markAsWatched({ mediaFileId, duration }));
		}
	};

	return (
		<div className="relative">
			{isFetching && <Spinner className="absolute top-3 right-3 z-10 size-4" aria-label={m.web_refreshing_episodes()} />}
			<ScrollArea className="h-[80svh] w-full rounded-xl lg:h-[65vh]">
				<div className="grid gap-4 pr-4">
					{episodes.map((episode) => {
						const files = episode.mediaFiles;
						const defaultFile = files.find((f) => f.isDefault) ?? files[0];
						const mediaFileId = defaultFile?.id;
						const isHighlighted = highlightEpisodeNumber === episode.episodeNumber;
						const episodePlayback = playback?.episodes?.[episode.id];

						return (
							<DetailsEpisodeCard
								key={episode.id}
								episode={episode}
								isHighlighted={isHighlighted}
								episodePlayback={episodePlayback}
								isAdmin={isAdmin}
								isEpisodeMarking={isMarkingWatched && markingMediaFileId === mediaFileId}
								isEpisodeUnmarking={isUnmarkingWatched && unmarkingMediaFileId === mediaFileId}
								isEpisodeResetting={isResetting && resettingMediaFileId === mediaFileId}
								onNavigateToPlayer={navigateToPlayer}
								onToggleWatched={handleToggleWatched}
								onResetProgress={(fileId) => {
									detach(resetProgress(fileId));
								}}
								onSelectForFiles={setSelectedEpisodeForFiles}
								onRefreshEpisode={(id) => refreshEpisodeMutation.mutate(id)}
								onRefreshImage={(id) => refreshEpisodeImageMutation.mutate(id)}
								onRegisterRef={(el) => {
									if (el) episodeRefs.current.set(episode.episodeNumber, el);
								}}
							/>
						);
					})}
					{hasNextPage && (
						<div ref={loadMoreRef} className="flex justify-center py-4">
							{isFetchingNextPage ? (
								<div className="flex items-center gap-2 text-muted-foreground text-sm">
									<Spinner className="size-4" />
									<span>{m.web_loading_more_episodes()}</span>
								</div>
							) : (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => {
										detach(fetchNextPage());
									}}
									className="text-muted-foreground text-xs hover:text-foreground"
								>
									{m.web_load_more_episodes()}
								</Button>
							)}
						</div>
					)}
				</div>
			</ScrollArea>

			<MediaFilesDetailsDialog
				open={Boolean(selectedEpisodeForFiles)}
				onOpenChange={(open) => !open && setSelectedEpisodeForFiles(null)}
				metadataId={metadataId}
				episodeId={selectedEpisodeForFiles?.id}
				title={
					selectedEpisodeForFiles
						? `${selectedEpisodeForFiles.number}. ${selectedEpisodeForFiles.title ?? m.web_episode_fallback_title({ number: selectedEpisodeForFiles.number })}`
						: undefined
				}
			/>
		</div>
	);
}
