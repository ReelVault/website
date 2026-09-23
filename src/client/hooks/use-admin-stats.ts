import { useQuery } from "@tanstack/react-query";
import { reelvault } from "../client";
import { adminKeys } from "../utils/query-keys";

export const adminStatsQueryOptions = () => ({
	queryKey: adminKeys.stats(),
	queryFn: () => reelvault.admin.getStats(),
	refetchInterval: 15_000,
	refetchIntervalInBackground: false,
	staleTime: 10_000,
});

export function useAdminStats() {
	return useQuery(adminStatsQueryOptions());
}
