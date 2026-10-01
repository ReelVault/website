import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminAuditPage = lazyRouteComponent(() => import("@/pages/admin/audit/audit-page"));

// zod-free validateSearch — see src/routes/admin/media/index.tsx.
export type AdminAuditActionFilter = "all" | "create" | "update" | "delete";

export interface AdminAuditSearch {
	action?: Exclude<AdminAuditActionFilter, "all">;
	resourceType?: string;
	actorUserId?: string;
	ipAddress?: string;
	requestId?: string;
	/** `datetime-local` strings; converted to RFC 3339 by the page. */
	from?: string;
	to?: string;
	page?: number;
}

const AUDIT_ACTIONS: readonly AdminAuditActionFilter[] = ["all", "create", "update", "delete"];

function adminAuditSearchValidator(search: Record<string, unknown>): AdminAuditSearch {
	const rawPage = Number(search.page);

	return {
		action: AUDIT_ACTIONS.find((candidate) => candidate === search.action && candidate !== "all"),
		resourceType: typeof search.resourceType === "string" && search.resourceType !== "" ? search.resourceType : undefined,
		actorUserId: typeof search.actorUserId === "string" && search.actorUserId !== "" ? search.actorUserId : undefined,
		ipAddress: typeof search.ipAddress === "string" && search.ipAddress !== "" ? search.ipAddress : undefined,
		requestId: typeof search.requestId === "string" && search.requestId !== "" ? search.requestId : undefined,
		from: typeof search.from === "string" && search.from !== "" ? search.from : undefined,
		to: typeof search.to === "string" && search.to !== "" ? search.to : undefined,
		page: Number.isInteger(rawPage) && rawPage > 1 ? rawPage : undefined,
	};
}

export const Route = createFileRoute("/admin/audit")({
	validateSearch: adminAuditSearchValidator,
	component: AdminAuditPage,
});
