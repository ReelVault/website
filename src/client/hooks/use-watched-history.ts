import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { toastError } from "@/utils/toast-utils";
import { reelvault } from "../client";
import { watchedHistoryKeys } from "../utils/query-keys";

export const watchedHistoryQueryOptions = (limit = 100) =>
	queryOptions({
		queryKey: watchedHistoryKeys.list(limit),
		queryFn: () => reelvault.me.getWatchedHistory({ limit }),
		staleTime: 60_000,
	});

export function useWatchedHistory() {
	const queryClient = useQueryClient();

	const { data, isLoading, error, refetch } = useQuery(watchedHistoryQueryOptions(100));

	const clearMutation = useMutation({
		mutationFn: () => reelvault.me.clearWatchedHistory(),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: watchedHistoryKeys.listAll() });
		},
		onError: (err) => toastError(m.user_failed_to_clear_history(), err),
	});

	return {
		history: data?.data ?? [],
		total: data?.total ?? 0,
		isLoading,
		error,
		refetch,
		clearHistory: clearMutation.mutateAsync,
		isClearing: clearMutation.isPending,
	};
}
