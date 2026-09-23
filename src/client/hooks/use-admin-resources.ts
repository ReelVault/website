import { useQuery } from "@tanstack/react-query";
import { reelvault } from "../client";
import { adminKeys } from "../utils/query-keys";

export function useAdminResources() {
	return useQuery({
		queryKey: adminKeys.resources(),
		queryFn: () => reelvault.admin.getResources(),
		refetchInterval: 15_000,
		refetchIntervalInBackground: false,
		staleTime: 10_000,
	});
}
