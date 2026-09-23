import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "../../utils/toast-utils";
import { reelvault } from "../client";
import { episodeKeys, mePlaybackKeys, metadataKeys, seasonKeys } from "../utils/query-keys";
import { useProviderSearch } from "./use-providers";

export function useRematchMetadata({
	metadataId,
	mediaType,
	initialTitle,
	initialYear,
	onSuccess,
}: {
	metadataId: string;
	mediaType: "movie" | "tv_show";
	initialTitle: string;
	initialYear?: number;
	onSuccess?: () => void;
}) {
	const queryClient = useQueryClient();
	const [searchParams, setSearchParams] = useState<{
		title: string;
		year?: number | undefined;
		providerId?: string | undefined;
		externalId?: string | undefined;
	}>({
		title: initialTitle,
		year: initialYear,
	});

	const searchResultsQuery = useProviderSearch({
		mediaType,
		title: searchParams.title,
		year: searchParams.year,
		providerId: searchParams.providerId,
		externalId: searchParams.externalId,
	});

	const rematchMutation = useMutation({
		mutationFn: ({ providerId, externalId }: { providerId: string; externalId: string }) =>
			reelvault.metadata.rematch(metadataId, { providerId, externalId }),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: metadataKeys.byId(metadataId) }),
				queryClient.invalidateQueries({ queryKey: metadataKeys.details(metadataId) }),
				queryClient.invalidateQueries({ queryKey: metadataKeys.detailsView(metadataId) }),
				queryClient.invalidateQueries({ queryKey: metadataKeys.adminAll() }),
				queryClient.invalidateQueries({ queryKey: seasonKeys.byMetadata(metadataId) }),
				queryClient.invalidateQueries({ queryKey: episodeKeys.byMetadata(metadataId) }),
				queryClient.invalidateQueries({ queryKey: mePlaybackKeys.progress(metadataId) }),
				queryClient.invalidateQueries({ queryKey: mePlaybackKeys.suggestions(metadataId) }),
				queryClient.invalidateQueries({ queryKey: mePlaybackKeys.continueWatching() }),
			]);
			toast.success(m.toast_rematch_updated());
			onSuccess?.();
		},
		onError: (error) => {
			console.error("Rematch failed:", error);
			toastError(m.toast_rematch_change_failed(), error);
		},
	});

	const linkProviderMutation = useMutation({
		mutationFn: ({ providerId, externalId }: { providerId: string; externalId: string }) =>
			reelvault.metadata.linkProvider(metadataId, { providerId, externalId }),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: metadataKeys.byId(metadataId) }),
				queryClient.invalidateQueries({ queryKey: metadataKeys.details(metadataId) }),
				queryClient.invalidateQueries({ queryKey: metadataKeys.detailsView(metadataId) }),
				queryClient.invalidateQueries({ queryKey: metadataKeys.adminAll() }),
				queryClient.invalidateQueries({ queryKey: seasonKeys.byMetadata(metadataId) }),
				queryClient.invalidateQueries({ queryKey: episodeKeys.byMetadata(metadataId) }),
				queryClient.invalidateQueries({ queryKey: mePlaybackKeys.progress(metadataId) }),
				queryClient.invalidateQueries({ queryKey: mePlaybackKeys.suggestions(metadataId) }),
				queryClient.invalidateQueries({ queryKey: mePlaybackKeys.continueWatching() }),
			]);
			toast.success(m.toast_rematch_filled());
			onSuccess?.();
		},
		onError: (error) => {
			console.error("Link provider failed:", error);
			toastError(m.toast_rematch_fill_failed(), error);
		},
	});

	const triggerSearch = (title: string, year?: number) => {
		setSearchParams({ title, year });
	};

	const triggerExternalIdSearch = (providerId: string, externalId: string) => {
		setSearchParams({ title: "", providerId, externalId });
	};

	return {
		searchResults: searchResultsQuery.data ?? [],
		isSearching: searchResultsQuery.isFetching,
		isSearchError: searchResultsQuery.isError,
		triggerSearch,
		triggerExternalIdSearch,
		rematch: rematchMutation.mutate,
		isRematching: rematchMutation.isPending,
		linkProvider: linkProviderMutation.mutate,
		isLinking: linkProviderMutation.isPending,
	};
}
