import { useQuery } from "@tanstack/react-query";
import { reelvault } from "../client";
import { adminKeys } from "../utils/query-keys";

export function useAdminCacheStats() {
	return useQuery({
		queryKey: adminKeys.cacheStats(),
		queryFn: () => reelvault.admin.getCacheStats(),
		refetchInterval: 30_000,
		refetchIntervalInBackground: false,
		staleTime: 20_000,
	});
}
