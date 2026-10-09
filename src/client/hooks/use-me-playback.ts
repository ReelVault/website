import type { WatchStateBulk, WatchStateScope } from "@reelvault/sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "../../utils/toast-utils";
import { reelvault } from "../client";
import { mePlaybackKeys, metadataKeys, watchedHistoryKeys } from "../utils/query-keys";

export function usePlaybackSuggestion(metadataId: string, options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: mePlaybackKeys.suggestions(metadataId),
		queryFn: () => reelvault.me.getPlaybackSuggestions(metadataId),
		staleTime: 1000 * 60 * 5,
		enabled: options?.enabled ?? metadataId.trim().length > 0,
	});
}

export function usePlaybackProgress(metadataId: string, options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: mePlaybackKeys.progress(metadataId),
		queryFn: () => reelvault.me.getPlaybackProgress(metadataId),
		staleTime: 1000 * 15,
		enabled: (options?.enabled ?? true) && metadataId.trim().length > 0,
	});
}

export function savePlaybackProgress(
	mediaFileId: string | undefined,
	position: number,
	options?: {
		audioStreamIndex?: number | null;
		subtitleId?: string | null;
		audioLanguage?: string | null;
		subtitleLanguage?: string | null;
	},
) {
	if (!mediaFileId) return Promise.resolve({ success: true as const });

	// The server owns validation here: null/undefined/non-finite positions
	// normalize to 0 and out-of-range positions clamp to the file duration.
	return reelvault.me.updatePlaybackProgress(mediaFileId, {
		position,
		audioStreamIndex: options?.audioStreamIndex,
		subtitleId: options?.subtitleId,
		audioLanguage: options?.audioLanguage,
		subtitleLanguage: options?.subtitleLanguage,
	});
}

export function usePlaybackMutations(metadataId?: string) {
	const queryClient = useQueryClient();

	const invalidatePlayback = async () => {
		const invalidations: Array<Promise<unknown>> = [
			queryClient.invalidateQueries({ queryKey: mePlaybackKeys.continueWatching() }),
			queryClient.invalidateQueries({ queryKey: mePlaybackKeys.progressAll() }),
			queryClient.invalidateQueries({ queryKey: mePlaybackKeys.suggestionsAll() }),
			queryClient.invalidateQueries({ queryKey: watchedHistoryKeys.listAll() }),
		];
		if (metadataId) {
			invalidations.push(queryClient.invalidateQueries({ queryKey: metadataKeys.detailsView(metadataId) }));
		}

		await Promise.all(invalidations);
	};

	const resetMutation = useMutation({
		mutationFn: ({ mediaFileId, scope }: { mediaFileId: string; scope?: WatchStateScope }) =>
			reelvault.me.resetPlaybackProgress(mediaFileId, { scope }),
		onSuccess: async () => {
			await invalidatePlayback();
			toast.success(m.toast_me_playback_progress_reset());
		},
		onError: (error) => toastError(m.toast_me_playback_reset_progress_failed(), error),
	});

	const markAsWatchedMutation = useMutation({
		mutationFn: ({ mediaFileId, duration }: { mediaFileId: string; duration?: number | null }) =>
			reelvault.me.updatePlaybackProgress(mediaFileId, {
				position: duration && duration > 0 ? duration : Number.MAX_SAFE_INTEGER,
			}),
		onSuccess: async () => {
			await invalidatePlayback();
			toast.success(m.toast_me_playback_marked_watched());
		},
		onError: (error) => toastError(m.toast_me_playback_mark_watched_failed(), error),
	});

	// An episode is unmarked on its own: the title-wide reset would clear the whole series.
	const unmarkWatchedMutation = useMutation({
		mutationFn: (mediaFileId: string) => reelvault.me.resetPlaybackProgress(mediaFileId, { scope: "file" }),
		onSuccess: async () => {
			await invalidatePlayback();
			toast.success(m.toast_me_playback_unmarked_watched());
		},
		onError: (error) => toastError(m.toast_me_playback_unmark_watched_failed(), error),
	});

	const setWatchStateMutation = useMutation({
		mutationFn: (input: WatchStateBulk) => reelvault.me.setWatchStateBulk(input),
		onSuccess: async (_result, input) => {
			await invalidatePlayback();
			toast.success(input.watched ? m.toast_me_playback_marked_watched() : m.toast_me_playback_unmarked_watched());
		},
		onError: (error, input) =>
			toastError(input.watched ? m.toast_me_playback_mark_watched_failed() : m.toast_me_playback_unmark_watched_failed(), error),
	});

	return {
		resetProgress: (mediaFileId: string, scope?: WatchStateScope) => resetMutation.mutateAsync({ mediaFileId, scope }),
		isResetting: resetMutation.isPending,
		resettingMediaFileId: resetMutation.variables?.mediaFileId,

		setWatchState: setWatchStateMutation.mutateAsync,
		isSettingWatchState: setWatchStateMutation.isPending,

		markAsWatched: markAsWatchedMutation.mutateAsync,
		isMarkingWatched: markAsWatchedMutation.isPending,
		markingMediaFileId: markAsWatchedMutation.variables?.mediaFileId,

		unmarkWatched: unmarkWatchedMutation.mutateAsync,
		isUnmarkingWatched: unmarkWatchedMutation.isPending,
		unmarkingMediaFileId: unmarkWatchedMutation.variables,
	};
}
