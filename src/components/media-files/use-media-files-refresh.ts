import { useRefreshMetadata, useRefreshMetadataImages } from "@/client/hooks/use-admin-metadata";
import { useRefreshEpisode, useRefreshEpisodeImage } from "@/client/hooks/use-episodes";

interface UseMediaFilesRefreshOptions {
	metadataId?: string;
	episodeId?: string;
}

/** Admin refresh actions for a title or an episode, with the pending flags the buttons need. */
export function useMediaFilesRefresh({ metadataId, episodeId }: UseMediaFilesRefreshOptions) {
	const refreshMetadataMutation = useRefreshMetadata();
	const refreshImagesMutation = useRefreshMetadataImages();
	const refreshEpisodeMutation = useRefreshEpisode(metadataId);
	const refreshEpisodeImageMutation = useRefreshEpisodeImage(metadataId);

	return {
		isRefreshingEpisode: refreshEpisodeMutation.isPending,
		isRefreshingEpisodeImage: refreshEpisodeImageMutation.isPending,
		isRefreshingMetadata: refreshMetadataMutation.isPending,
		isRefreshingImages: refreshImagesMutation.isPending,
		onRefreshEpisode: () => {
			if (episodeId) refreshEpisodeMutation.mutate(episodeId);
		},
		onRefreshEpisodeImage: () => {
			if (episodeId) refreshEpisodeImageMutation.mutate(episodeId);
		},
		onRefreshMetadata: () => {
			if (metadataId) refreshMetadataMutation.mutate(metadataId);
		},
		onRefreshImages: () => {
			if (metadataId) refreshImagesMutation.mutate(metadataId);
		},
	};
}
