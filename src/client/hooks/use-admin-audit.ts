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
	from?: string;
	to?: string;
}

const emptyToUndefined = (value: string | undefined): string | undefined => (value === "" ? undefined : value);

export function useAdminAudit(params: UseAdminAuditParams = {}) {
	const { action, resourceType, actorUserId, page = 1, limit = 25, ipAddress, requestId, from, to } = params;
	const effectiveAction = action && action !== "all" ? action : undefined;

	const query = useQuery({
		queryKey: adminKeys.audit({ action: effectiveAction, resourceType, actorUserId, page, limit, ipAddress, requestId, from, to }),
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
				from: emptyToUndefined(from),
				to: emptyToUndefined(to),
			}),
		staleTime: 600_000,
	});

	return {
		entries: query.data?.data ?? [],
		pagination: query.data?.pagination ?? emptyPagination(limit),
		isLoading: query.isLoading,
		isFetching: query.isFetching,
		error: query.error,
		refetch: query.refetch,
	};
}
