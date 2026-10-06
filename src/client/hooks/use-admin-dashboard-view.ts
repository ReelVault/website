import { useQuery, useQueryClient } from "@tanstack/react-query";
import { reelvault } from "../client";
import { adminKeys, libraryKeys } from "../utils/query-keys";

/**
 * The admin dashboard composite: ONE request replaces the six the page used
 * to fire on mount (stats, libraries, worker operations, audit feed, error
 * logs, update status). The response seeds each consuming hook's query cache
 * with its EXACT key, so DashboardWorkerQueue / DashboardAuditFeed /
 * DashboardErrorLogs / DashboardUpdateStatus keep reading their own queries
 * unchanged. Keys below must stay in sync with those hooks — a mismatch
 * silently falls back to the individual fetches.
 */
export const dashboardViewQueryOptions = () => ({
	queryKey: [...adminKeys.all, "dashboard-view"] as const,
	queryFn: () => reelvault.admin.getDashboardView(),
	staleTime: 10_000,
});

export function useAdminDashboardView() {
	const queryClient = useQueryClient();
	const query = useQuery(dashboardViewQueryOptions());

	if (query.data) {
		// Seed AFTER render decision (rendering stays pending until data exists —
		// the composite's own pending state gates the page identically).
		queryClient.setQueryData(adminKeys.stats(), query.data.stats);
		queryClient.setQueryData(libraryKeys.admin(), {
			page: 1,
			limit: query.data.libraries.length,
			total: query.data.libraries.length,
			totalPages: query.data.libraries.length > 0 ? 1 : 0,
			data: query.data.libraries,
		});
		queryClient.setQueryData(adminKeys.workerOperations({ page: 1, limit: 8, status: undefined }), query.data.operations);
		queryClient.setQueryData(
			adminKeys.audit({
				action: undefined,
				resourceType: undefined,
				actorUserId: undefined,
				page: 1,
				limit: 6,
				ipAddress: undefined,
				requestId: undefined,
				from: undefined,
				to: undefined,
			}),
			query.data.audit,
		);
		queryClient.setQueryData(
			adminKeys.logs({ fileId: undefined, level: "warn,error,fatal", search: undefined, page: 1, limit: 6 }),
			query.data.logs,
		);
		queryClient.setQueryData(adminKeys.updateStatus(), query.data.update);
	}

	return query;
}
