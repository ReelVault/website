import type { QueryClient } from "@tanstack/react-query";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { reelvault } from "../client";
import { adminKeys, libraryKeys } from "../utils/query-keys";

type DashboardView = Awaited<ReturnType<typeof reelvault.admin.getDashboardView>>;

/**
 * Seeds each consuming hook's cache with its EXACT key so DashboardWorkerQueue /
 * DashboardAuditFeed / DashboardErrorLogs / DashboardUpdateStatus keep reading
 * their own queries unchanged. Keys must stay in sync with those hooks — a
 * mismatch silently falls back to the individual fetches.
 */
function seedDashboardViewCaches(queryClient: QueryClient, data: DashboardView): void {
	queryClient.setQueryData(adminKeys.stats(), data.stats);
	queryClient.setQueryData(libraryKeys.admin(), {
		page: 1,
		limit: data.libraries.length,
		total: data.libraries.length,
		totalPages: data.libraries.length > 0 ? 1 : 0,
		data: data.libraries,
	});
	queryClient.setQueryData(adminKeys.workerOperations({ page: 1, limit: 8, status: undefined }), data.operations);
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
		data.audit,
	);
	queryClient.setQueryData(
		adminKeys.logs({ fileId: undefined, level: "warn,error,fatal", search: undefined, page: 1, limit: 6 }),
		data.logs,
	);
	queryClient.setQueryData(adminKeys.updateStatus(), data.update);
}

/**
 * The admin dashboard composite: ONE request replaces the six the page used to
 * fire on mount (stats, libraries, worker operations, audit feed, error logs,
 * update status). The response seeds each consumer's cache with its exact key via
 * `seedDashboardViewCaches`.
 */
export function useAdminDashboardView() {
	const queryClient = useQueryClient();

	return useQuery({
		queryKey: [...adminKeys.all, "dashboard-view"] as const,
		queryFn: async () => {
			const data = await reelvault.admin.getDashboardView();
			// Seed at fetch resolution (not during render) so consumers read the
			// seeded caches the moment the page renders with data.
			seedDashboardViewCaches(queryClient, data);

			return data;
		},
		staleTime: 10_000,
	});
}
