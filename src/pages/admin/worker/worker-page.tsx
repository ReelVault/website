import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useScheduledTasks } from "@/client/hooks/use-scheduled-tasks";
import { useWorkerStats } from "@/client/hooks/use-worker-stats";
import { adminKeys } from "@/client/utils/query-keys";
import { detach } from "@/lib/detach";
import type { WorkerTab } from "@/routes/admin/worker";
import { WorkerPageHeader } from "./components/worker-page-header";
import { WorkerStatsSummaryKpis } from "./components/worker-stats-summary-kpis";
import { WorkerTabsSection } from "./components/worker-tabs-section";
import type { WorkerTotals } from "./components/worker-utils";

export default function AdminWorkerPage() {
	const { tab = "scheduled" } = useSearch({ from: "/admin/worker" });
	const navigate = useNavigate({ from: "/admin/worker" });
	const queryClient = useQueryClient();
	const [autoRefresh, setAutoRefresh] = useState(true);

	// One shared workers() subscription feeds the header totals and the KPI strip.
	const statsQuery = useWorkerStats(autoRefresh);
	const totals: WorkerTotals = { waiting: 0, active: 0, completed: 0, failed: 0 };
	for (const worker of statsQuery.data ?? []) {
		totals.waiting += worker.stats.waiting;
		totals.active += worker.stats.active;
		totals.completed += worker.stats.completed;
		totals.failed += worker.stats.failed;
	}

	// The header keeps the global "stop the queues" action; per-scope actions live
	// inside their tabs.
	const { cancelAllWorkers, isCancellingAll } = useScheduledTasks(autoRefresh);

	const setTab = (next: WorkerTab) => {
		detach(navigate({ search: (prev) => ({ ...prev, tab: next === "scheduled" ? undefined : next }) }));
	};

	const handleRefreshAll = () => {
		detach(
			Promise.all([
				queryClient.invalidateQueries({ queryKey: adminKeys.workers() }),
				queryClient.invalidateQueries({ queryKey: adminKeys.workerOperations() }),
				queryClient.invalidateQueries({ queryKey: adminKeys.processes() }),
			]),
		);
	};

	return (
		<div className="flex flex-col gap-6">
			<WorkerPageHeader
				autoRefresh={autoRefresh}
				onToggleAutoRefresh={() => setAutoRefresh((v) => !v)}
				onRefreshAll={handleRefreshAll}
				isAnyRefetching={statsQuery.isRefetching}
				totals={totals}
				cancelAllWorkers={() => detach(cancelAllWorkers)}
				isCancellingAll={isCancellingAll}
			/>

			<WorkerStatsSummaryKpis totals={totals} isLoading={statsQuery.isLoading} isError={statsQuery.isError} />

			<WorkerTabsSection tab={tab} onTabChange={setTab} autoRefresh={autoRefresh} />
		</div>
	);
}
