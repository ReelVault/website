import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminWorkerPage = lazyRouteComponent(() => import("@/pages/admin/worker/worker-page"));

// zod-free validateSearch — see src/routes/admin/plugins/index.tsx.
export type WorkerTab = "scheduled" | "activity" | "history";
export type WorkerHistoryStatus = "pending" | "running" | "completed" | "failed" | "cancelled";
export const WORKER_TABS: readonly WorkerTab[] = ["scheduled", "activity", "history"];

interface AdminWorkerSearch {
	tab?: WorkerTab;
	status?: WorkerHistoryStatus;
	page?: number;
}

const WORKER_HISTORY_STATUSES: readonly WorkerHistoryStatus[] = ["pending", "running", "completed", "failed", "cancelled"];

// Page 1 is the default — keep it out of the URL.
function parseWorkerPage(value: unknown): number | undefined {
	let parsed = Number.NaN;
	if (typeof value === "number") parsed = value;
	if (typeof value === "string") parsed = Number.parseInt(value, 10);

	return Number.isInteger(parsed) && parsed > 1 ? parsed : undefined;
}

function adminWorkerSearchValidator(search: Record<string, unknown>): AdminWorkerSearch {
	return {
		tab: WORKER_TABS.find((candidate) => candidate === search.tab),
		status: WORKER_HISTORY_STATUSES.find((candidate) => candidate === search.status),
		page: parseWorkerPage(search.page),
	};
}

export const Route = createFileRoute("/admin/worker")({
	validateSearch: adminWorkerSearchValidator,
	component: AdminWorkerPage,
});
