import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "@/utils/toast-utils";
import { reelvault } from "../client";
import { mediaFileFields } from "../utils/fields";
import { mediaKeys, mePlaybackKeys, metadataKeys } from "../utils/query-keys";

export const mediaFileQueryOptions = (mediaFileId: string) => ({
	queryKey: mediaKeys.file(mediaFileId),
	queryFn: () => reelvault.media.getById(mediaFileId, { fields: mediaFileFields }),
	staleTime: Number.POSITIVE_INFINITY,
});

export function useMediaFilesByMetadata(metadataId: string | null | undefined, options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: mediaKeys.byMetadata(metadataId),
		queryFn: async () => {
			if (!metadataId) return [];

			const res = await reelvault.media.getAll({
				metadataId,
				limit: 100,
			});

			return res.data;
		},
		enabled: (options?.enabled ?? true) && Boolean(metadataId),
		staleTime: 1000 * 60 * 10,
	});
}

export function useMediaFilesByEpisode(episodeId: string | null | undefined, options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: mediaKeys.byEpisode(episodeId),
		queryFn: async () => {
			if (!episodeId) return [];

			const res = await reelvault.media.getAll({
				episodeId,
				limit: 50,
			});

			return res.data;
		},
		enabled: (options?.enabled ?? true) && Boolean(episodeId),
		staleTime: 1000 * 60 * 10,
	});
}

/** Refreshes the technical metadata of a media file after its source changes. */
export function useRefreshMediaFile(metadataId?: string) {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: (mediaFileId: string) => reelvault.media.refresh(mediaFileId),
		onSuccess: async (_, mediaFileId) => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: mediaKeys.file(mediaFileId) }),
				...(metadataId ? [queryClient.invalidateQueries({ queryKey: metadataKeys.detailsView(metadataId) })] : []),
				queryClient.invalidateQueries({ queryKey: mePlaybackKeys.progressAll() }),
				queryClient.invalidateQueries({ queryKey: mePlaybackKeys.continueWatching() }),
				queryClient.invalidateQueries({ queryKey: mePlaybackKeys.streamPrefs(mediaFileId) }),
			]);
			toast.success(m.toast_file_info_refreshed());
		},
		onError: (error) => toastError(m.toast_file_info_refresh_failed(), error),
	});

	return {
		refreshMediaFile: mutation.mutate,
		refreshMediaFileAsync: mutation.mutateAsync,
		refreshingMediaFileId: mutation.isPending ? mutation.variables : undefined,
	};
}
