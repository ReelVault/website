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
