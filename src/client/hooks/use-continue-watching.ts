import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "../../utils/toast-utils";
import { reelvault } from "../client";
import { mePlaybackKeys, watchedHistoryKeys } from "../utils/query-keys";

export function useContinueWatching() {
	const queryClient = useQueryClient();
	const query = useQuery({
		queryKey: mePlaybackKeys.continueWatching(),
		queryFn: () => reelvault.me.getContinueWatching(12),
		staleTime: 15_000,
	});
	const resetMutation = useMutation({
		mutationFn: (mediaFileId: string) => reelvault.me.resetPlaybackProgress(mediaFileId),
		onSuccess: async (_, mediaFileId) => {
			// Optimistic write from the mutation response — invalidating the same key
			// right after setQueryData would drop the fresh result (server response = truth).
			queryClient.setQueryData<typeof query.data>(mePlaybackKeys.continueWatching(), (current) =>
				current ? { ...current, items: current.items.filter((item) => item.mediaFileId !== mediaFileId) } : current,
			);
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: mePlaybackKeys.progressAll() }),
				queryClient.invalidateQueries({ queryKey: mePlaybackKeys.suggestionsAll() }),
				queryClient.invalidateQueries({ queryKey: watchedHistoryKeys.listAll() }),
			]);
			toast.success(m.toast_me_playback_progress_reset());
		},
		onError: (error) => toastError(m.toast_me_playback_reset_progress_failed(), error),
	});

	const markAsWatchedMutation = useMutation({
		mutationFn: ({ mediaFileId, duration }: { mediaFileId: string; duration?: number }) =>
			reelvault.me.updatePlaybackProgress(mediaFileId, {
				position: duration && duration > 0 ? duration : Number.MAX_SAFE_INTEGER,
			}),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: mePlaybackKeys.continueWatching() }),
				queryClient.invalidateQueries({ queryKey: mePlaybackKeys.progressAll() }),
				queryClient.invalidateQueries({ queryKey: mePlaybackKeys.suggestionsAll() }),
				queryClient.invalidateQueries({ queryKey: watchedHistoryKeys.listAll() }),
			]);
			toast.success(m.toast_me_playback_marked_watched());
		},
		onError: (error) => toastError(m.toast_me_playback_mark_watched_failed(), error),
	});

	return {
		query,
		items: query.data?.items ?? [],
		resetProgress: resetMutation.mutateAsync,
		isResetting: resetMutation.isPending,
		resettingMediaFileId: resetMutation.variables,
		markAsWatched: markAsWatchedMutation.mutateAsync,
		isMarkingWatched: markAsWatchedMutation.isPending,
		markingMediaFileId: markAsWatchedMutation.variables?.mediaFileId,
	};
}
