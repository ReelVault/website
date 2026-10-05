import type { SeasonWithEpisodes } from "@reelvault/sdk";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useRefreshEpisode, useRefreshEpisodeImage } from "@/client/hooks/use-episodes";
import { usePlaybackMutations } from "@/client/hooks/use-me-playback";
import { AppEmptyState } from "@/components/app-states";
import { MediaFilesDetailsDialog } from "@/components/media-files-details-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { DetailsEpisodeCard } from "./details-episode-card";

// Episodes ride the details-view composite (seasons carry their full episode
// lists), so this section is a pure render of view data — no fetch, no paging.
export function DetailsEpisodes({
	metadataId,
	seasonId,
	episodes,
	highlightEpisodeNumber,
	playback,
	isAdmin,
}: {
	metadataId: string;
	seasonId: string | null;
	episodes: SeasonWithEpisodes["episodes"];
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
			highlightEpisodeNumber !== undefined && episodes.length > 0
				? window.setTimeout(() => {
						const el = episodeRefs.current.get(highlightEpisodeNumber);
						el?.scrollIntoView({ behavior: "smooth", block: "center" });
					}, 150)
				: 0;

		return () => {
			window.clearTimeout(timer);
		};
	}, [highlightEpisodeNumber, episodes.length]);

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
