import { useQueryClient } from "@tanstack/react-query";
import { startTransition, useState } from "react";
import { reelvault } from "@/client/client";
import { useRefreshMetadata, useRefreshMetadataImages } from "@/client/hooks/use-admin-metadata";
import { useIsAdmin } from "@/client/hooks/use-current-profile";
import { usePlaybackMutations, usePlaybackSuggestion } from "@/client/hooks/use-me-playback";
import { useIsOnWatchlist, useWatchlistToggle } from "@/client/hooks/use-watchlist";
import { mePlaybackKeys } from "@/client/utils/query-keys";
import { m } from "@/paraglide/messages";
import { copyEntityLink, copyToClipboard } from "@/utils/clipboard-utils";
import { toast } from "@/utils/toast-facade";

interface MetadataCardTarget {
	id: string;
	title: string;
}

export function useMetadataCardActions(metadata: MetadataCardTarget) {
	const [fileDetailsOpen, setFileDetailsOpen] = useState(false);
	const [identifyOpen, setIdentifyOpen] = useState(false);
	const [isInteracted, setIsInteracted] = useState(false);

	const isAdmin = useIsAdmin();

	const { data: streamData, isLoading: isSuggestionLoading } = usePlaybackSuggestion(metadata.id, {
		enabled: isInteracted,
	});
	const suggestion = streamData?.suggestion;
	const { isOnWatchlist } = useIsOnWatchlist(metadata.id);
	const watchlistToggle = useWatchlistToggle();

	const queryClient = useQueryClient();
	const { markAsWatched, isMarkingWatched } = usePlaybackMutations(metadata.id);

	const refreshMetadataMutation = useRefreshMetadata();
	const refreshImagesMutation = useRefreshMetadataImages();

	const handleMarkWatched = (): void => {
		// Transition consumes the async lookup + mutation without a floating chain.
		startTransition(async () => {
			let mediaFileId = suggestion?.mediaFileId;
			if (!mediaFileId) {
				try {
					const result = await queryClient.query({
						queryKey: mePlaybackKeys.suggestions(metadata.id),
						queryFn: () => reelvault.me.getPlaybackSuggestions(metadata.id),
					});
					mediaFileId = result.suggestion?.mediaFileId;
				} catch {
					// No cached suggestion available — fall through to the "no video" toast.
				}
			}

			if (mediaFileId) {
				await markAsWatched({ mediaFileId });
			} else {
				toast.error(m.components_no_video_file_to_mark());
			}
		});
	};

	const handleAddToWatchlist = (): void => {
		const nextState = !isOnWatchlist;
		watchlistToggle.mutate(metadata.id, {
			onSuccess: () =>
				toast.success(nextState ? m.components_metadata_card_added_to_list() : m.components_metadata_card_removed_from_list()),
		});
	};

	const handleCopyLink = (): void => {
		startTransition(() => copyEntityLink(`/details/${metadata.id}`, m.components_collection_card_title_link()));
	};

	const handleCopyId = (): void => {
		startTransition(() => copyToClipboard(metadata.id, m.components_copy_metadata_id()));
	};

	const handleInteract = () => {
		if (!isInteracted) setIsInteracted(true);
	};

	const handleOpenFileDetails = () => setFileDetailsOpen(true);
	const handleOpenIdentify = () => setIdentifyOpen(true);
	const handleRefreshMetadata = () => refreshMetadataMutation.mutate(metadata.id);
	const handleRefreshImages = () => refreshImagesMutation.mutate(metadata.id);

	return {
		fileDetailsOpen,
		setFileDetailsOpen,
		identifyOpen,
		setIdentifyOpen,
		isInteracted,
		handleInteract,
		isAdmin,
		suggestion,
		isSuggestionLoading,
		isOnWatchlist,
		isWatchlistPending: watchlistToggle.isPending,
		isMarkingWatched,
		handleMarkWatched,
		handleAddToWatchlist,
		handleCopyLink,
		handleCopyId,
		handleOpenFileDetails,
		handleOpenIdentify,
		handleRefreshMetadata,
		handleRefreshImages,
	};
}
