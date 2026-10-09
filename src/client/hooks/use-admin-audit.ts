import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { reelvault } from "../client";
import { emptyPagination } from "../utils/query-helpers";
import { adminKeys } from "../utils/query-keys";

export type AdminAuditAction = "all" | "create" | "update" | "delete";

interface UseAdminAuditParams {
	action?: AdminAuditAction;
	resourceType?: string;
	actorUserId?: string;
	page?: number;
	limit?: number;
	ipAddress?: string;
	requestId?: string;
	q?: string;
	from?: string;
	to?: string;
}

const emptyToUndefined = (value: string | undefined): string | undefined => (value === "" ? undefined : value);

/** The audit filters the summary shares with the list (paging excluded). */
export type AdminAuditSummaryFilters = Omit<UseAdminAuditParams, "page" | "limit">;

export function useAdminAuditSummary(params: AdminAuditSummaryFilters = {}) {
	const { action, resourceType, actorUserId, ipAddress, requestId, q, from, to } = params;
	const effectiveAction = action && action !== "all" ? action : undefined;

	return useQuery({
		queryKey: adminKeys.auditSummary({ action: effectiveAction, resourceType, actorUserId, ipAddress, requestId, q, from, to }),
		placeholderData: keepPreviousData,
		queryFn: () =>
			reelvault.admin.getAuditSummary({
				action: effectiveAction,
				resourceType: emptyToUndefined(resourceType),
				actorUserId: emptyToUndefined(actorUserId),
				ipAddress: emptyToUndefined(ipAddress),
				requestId: emptyToUndefined(requestId),
				q: emptyToUndefined(q),
				from: emptyToUndefined(from),
				to: emptyToUndefined(to),
				limit: 10,
			}),
		staleTime: 600_000,
	});
}

/** The values the audit filter dropdowns offer: resource types in the log and the administrators who wrote entries. */
export function useAdminAuditOptions() {
	return useQuery({
		queryKey: adminKeys.auditOptions(),
		queryFn: () => reelvault.admin.getAuditOptions(),
		staleTime: 600_000,
	});
}

export function useAdminAudit(params: UseAdminAuditParams = {}) {
	const { action, resourceType, actorUserId, page = 1, limit = 25, ipAddress, requestId, q, from, to } = params;
	const effectiveAction = action && action !== "all" ? action : undefined;

	const query = useQuery({
		queryKey: adminKeys.audit({ action: effectiveAction, resourceType, actorUserId, page, limit, ipAddress, requestId, q, from, to }),
		placeholderData: keepPreviousData,
		queryFn: () =>
			reelvault.admin.getAudit({
				action: effectiveAction,
				resourceType: emptyToUndefined(resourceType),
				actorUserId: emptyToUndefined(actorUserId),
				page,
				limit,
				ipAddress: emptyToUndefined(ipAddress),
				requestId: emptyToUndefined(requestId),
				q: emptyToUndefined(q),
				from: emptyToUndefined(from),
				to: emptyToUndefined(to),
			}),
		staleTime: 600_000,
	});

	const empty = emptyPagination(limit);

	return {
		entries: query.data?.data ?? [],
		total: query.data?.total ?? empty.total,
		totalPages: query.data?.totalPages ?? empty.totalPages,
		isLoading: query.isLoading,
		isFetching: query.isFetching,
		error: query.error,
		refetch: query.refetch,
	};
}
