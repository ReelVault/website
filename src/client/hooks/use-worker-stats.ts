import { useQuery } from "@tanstack/react-query";
import { reelvault } from "../client";
import { pollWhile } from "../utils/poll-while";
import { adminKeys } from "../utils/query-keys";

/**
 * Single subscription to GET /admin/workers — the response feeds both the
 * scheduled-task list and the queue/pool stats, so every consumer shares this
 * query (one poller, one cache entry) instead of each hook polling on its own.
 */
export function useWorkerStats(autoRefresh = true) {
	return useQuery({
		queryKey: adminKeys.workers(),
		queryFn: () => reelvault.admin.getWorkers(),
		staleTime: 15_000,
		refetchInterval: pollWhile({
			enabled: autoRefresh,
			isActive: (data) => data?.some((w) => w.stats.active > 0 || w.stats.waiting > 0) ?? false,
			activeMs: 5_000,
		}),
	});
}
