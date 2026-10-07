import type { AdminStats } from "@reelvault/sdk";
import { useQuery } from "@tanstack/react-query";
import { reelvault } from "../client";
import { pollWhile } from "../utils/poll-while";
import { adminKeys } from "../utils/query-keys";

export const adminStatsQueryOptions = () => ({
	queryKey: adminKeys.stats(),
	queryFn: () => reelvault.admin.getStats(),
	// Poll fast only while the server is actually working (active streams or
	// worker jobs); otherwise back off to a minute. A flat 15 s interval kept
	// every admin page hitting the API forever, even fully idle.
	refetchInterval: pollWhile<AdminStats>({
		isActive: (data) => (data?.streaming.activeSessions ?? 0) > 0 || (data?.workers?.active ?? 0) + (data?.workers?.waiting ?? 0) > 0,
		activeMs: 15_000,
		idleMs: 60_000,
	}),
	refetchIntervalInBackground: false,
	staleTime: 10_000,
});

export function useAdminStats() {
	return useQuery(adminStatsQueryOptions());
}
