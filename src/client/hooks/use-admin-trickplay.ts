import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "../../utils/toast-utils";
import { reelvault } from "../client";
import { pollWhile } from "../utils/poll-while";
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
/** Removes the core trickplay previews of several media files in one request (up to 500 files). */
export function useDeleteTrickplayMany() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (mediaFileIds: string[]) => reelvault.admin.deleteTrickplayMany(mediaFileIds),
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

/** Queue previews for one library: the files without previews, or every file when `force` is set. */
export function useRegenerateTrickplay() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (params: { scope: "library" | "title" | "season"; id: string; force: boolean }) =>
			reelvault.admin.regenerateTrickplay({ scope: params.scope, id: params.id, force: params.force }),
		onSuccess: async (result) => {
			toast.success(m.hooks_trickplay_regenerate_queued({ enqueued: result.enqueued }));
			await queryClient.invalidateQueries({ queryKey: adminKeys.trickplayStats() });
		},
		onError: (error) => {
			toastError(m.hooks_trickplay_regenerate_error(), error);
		},
	});
}

/** Outcome counts of one regeneration operation, polled while any of its jobs is still queued or running. */
export function useTrickplayRegenerationReport(operationId: string | undefined) {
	return useQuery({
		queryKey: adminKeys.trickplayRegenerationReport(operationId ?? ""),
		queryFn: () => reelvault.admin.getTrickplayRegenerationReport(operationId ?? ""),
		enabled: operationId !== undefined,
		refetchInterval: pollWhile({ isActive: (data) => (data?.unfinished ?? 0) > 0, activeMs: 3_000 }),
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

/** Previews a bulk removal would delete for these media files. Nothing is removed. Read on each open. */
export function useTrickplayDeletePreview(mediaFileIds: string[]) {
	return useQuery({
		queryKey: adminKeys.trickplayDeletePreview(mediaFileIds),
		queryFn: () => reelvault.admin.deleteTrickplayMany(mediaFileIds, { dryRun: true }),
		staleTime: 0,
	});
}
