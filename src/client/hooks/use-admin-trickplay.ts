import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "../../utils/toast-utils";
import { reelvault } from "../client";
import { adminKeys } from "../utils/query-keys";

export function useTrickplayStats() {
	const query = useQuery({
		queryKey: adminKeys.trickplayStats(),
		queryFn: () => reelvault.admin.getTrickplayStats(),
		staleTime: 15_000,
	});

	return {
		stats: query.data,
		isLoading: query.isLoading,
		isFetching: query.isFetching,
		error: query.error,
		refetch: query.refetch,
	};
}

/** Artifact rows per owner and kind, for the storage overview. */
export function useArtifactStats() {
	const query = useQuery({
		queryKey: adminKeys.artifactStats(),
		queryFn: () => reelvault.admin.getArtifactStats(),
		staleTime: 15_000,
	});

	return { artifacts: query.data?.artifacts ?? [], isLoading: query.isLoading, error: query.error };
}

/** Removes the trickplay previews of one media file (the player shows none until they are generated again). */
export function useDeleteTrickplay() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (mediaFileId: string) => reelvault.admin.deleteTrickplay(mediaFileId),
		onSuccess: async (result) => {
			toast.success(m.hooks_trickplay_removed({ count: result.artifacts }));
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: adminKeys.trickplayStats() }),
				queryClient.invalidateQueries({ queryKey: adminKeys.artifactStats() }),
			]);
		},
		onError: (error) => {
			toastError(m.hooks_trickplay_remove_error(), error);
		},
	});
}

/** Enqueue trickplay generation for every media file missing it. */
export function useGenerateAllTrickplay() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => reelvault.admin.generateAllTrickplay(),
		onSuccess: async (result) => {
			toast.success(m.hooks_trickplay_generate_all_queued({ count: result.enqueued }));
			await queryClient.invalidateQueries({ queryKey: adminKeys.trickplayStats() });
		},
		onError: (error) => {
			toastError(m.hooks_trickplay_generate_all_error(), error);
		},
	});
}
