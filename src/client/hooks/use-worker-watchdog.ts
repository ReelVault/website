import { useQuery } from "@tanstack/react-query";
import { reelvault } from "../client";
import { adminKeys } from "../utils/query-keys";

/**
 * Orphaned-job recoveries of the worker watchdog. The count only moves when the watchdog requeues a job,
 * so it is fetched on mount and on focus instead of being polled; the page refresh button invalidates it too.
 */
export function useWorkerWatchdog() {
	return useQuery({
		queryKey: adminKeys.workerWatchdog(),
		queryFn: () => reelvault.admin.getWorkerWatchdog(),
		staleTime: 60_000,
	});
}
