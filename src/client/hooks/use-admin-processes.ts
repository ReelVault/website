import { useQuery } from "@tanstack/react-query";
import { reelvault } from "../client";
import { pollWhile } from "../utils/poll-while";
import { adminKeys } from "../utils/query-keys";

export function useAdminProcesses(autoRefresh = true) {
	return useQuery({
		queryKey: adminKeys.processes(),
		queryFn: () => reelvault.admin.getProcesses(),
		// Fast while anything actually runs, slow (not stopped) when idle — the
		// card must notice a newly spawned process without spinning at 5s forever.
		refetchInterval: pollWhile({
			enabled: autoRefresh,
			isActive: (data) => (data?.counts.total ?? 0) > 0,
			activeMs: 5_000,
			idleMs: 30_000,
		}),
		staleTime: 3_000,
	});
}
