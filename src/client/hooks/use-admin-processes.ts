import { useQuery } from "@tanstack/react-query";
import { reelvault } from "../client";
import { adminKeys } from "../utils/query-keys";

export function useAdminProcesses(autoRefresh = true) {
	return useQuery({
		queryKey: adminKeys.processes(),
		queryFn: () => reelvault.admin.getProcesses(),
		refetchInterval: autoRefresh ? 5_000 : false,
		staleTime: 3_000,
	});
}
