import { useQuery } from "@tanstack/react-query";
import { reelvault } from "../client";
import { adminKeys } from "../utils/query-keys";

export function useAdminResources(hours = 24) {
	return useQuery({
		queryKey: adminKeys.resources(hours),
		queryFn: () => reelvault.admin.getResources({ hours }),
		refetchInterval: 15_000,
		refetchIntervalInBackground: false,
		staleTime: 10_000,
	});
}
