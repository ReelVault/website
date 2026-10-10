import { afterAll, afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { overwriteGetLocale } from "@/paraglide/runtime";
import { ensureDom, unregisterDom } from "./register-dom";

/**
 * The Activity tab badge on the worker page counts every active operation. The list holds one page
 * (50 operations here), so the badge must read the total of the response, not the length of the page.
 */

// React reads the browser's event support when it loads, so the DOM is installed before Testing Library and the page.
ensureDom();

const { cleanup, render } = await import("@testing-library/react");

overwriteGetLocale(() => "en");

const adminJobs = await import("@/client/hooks/use-admin-jobs");
const workerStats = await import("@/client/hooks/use-worker-stats");

await mock.module("@/client/hooks/use-admin-jobs", () => ({
	...adminJobs,
	useAdminActiveOperations: () => ({ data: { data: [], page: 1, limit: 50, total: 57, totalPages: 2 } }),
}));

await mock.module("@/client/hooks/use-worker-stats", () => ({
	...workerStats,
	useWorkerStats: () => ({ data: [], isLoading: false, isError: false }),
}));

const { WorkerTabsSection } = await import("@/pages/admin/worker/components/worker-tabs-section");

function renderTabs() {
	return render(
		<QueryClientProvider client={new QueryClient()}>
			<WorkerTabsSection tab="scheduled" onTabChange={() => undefined} autoRefresh={false} />
		</QueryClientProvider>,
	);
}

afterEach(() => cleanup());
afterAll(() => {
	mock.restore();
	unregisterDom();
});

const ACTIVITY_TAB = /Activity/;

describe("worker page activity badge", () => {
	test("the badge counts every active operation, not only the loaded page", () => {
		const view = renderTabs();

		expect(view.getByRole("tab", { name: ACTIVITY_TAB }).textContent).toContain("57");
	});
});
