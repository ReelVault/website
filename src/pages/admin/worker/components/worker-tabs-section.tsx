import type { WorkerOperation } from "@reelvault/sdk";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarClock, History, ListTree } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { useAdminActiveOperations } from "@/client/hooks/use-admin-jobs";
import { useWorkerStats } from "@/client/hooks/use-worker-stats";
import { adminKeys } from "@/client/utils/query-keys";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { WORKER_TABS, type WorkerTab } from "@/routes/admin/worker";
import { WorkerOperationDialog } from "./worker-operation-dialog";
import { WorkerScheduledTasksTab } from "./worker-scheduled-tasks-tab";

// Activity and history load on first tab open — they pull the operation cards,
// processes view and dialogs with them.
const LazyWorkerActivityTab = lazy(async () => {
	const mod = await import("./worker-activity-tab");

	return { default: mod.WorkerActivityTab };
});

const LazyWorkerHistoryTab = lazy(async () => {
	const mod = await import("./worker-history-tab");

	return { default: mod.WorkerHistoryTab };
});

const TAB_FALLBACK = <div className="h-40 animate-pulse rounded-xl bg-muted" />;

/**
 * URL-driven top-level tabs (scheduled / activity / history). Owns the shared
 * workers subscription for tab badges and the single operation-inspect dialog
 * both tabs can open.
 */
export function WorkerTabsSection({
	tab,
	onTabChange,
	autoRefresh,
}: {
	tab: WorkerTab;
	onTabChange: (tab: WorkerTab) => void;
	autoRefresh: boolean;
}) {
	const queryClient = useQueryClient();
	const statsQuery = useWorkerStats(autoRefresh);
	const tasks = statsQuery.data ?? [];
	const activeOperationsQuery = useAdminActiveOperations(autoRefresh);
	const activeOperations = activeOperationsQuery.data?.data ?? [];

	const [inspectingOperation, setInspectingOperation] = useState<WorkerOperation | null>(null);
	const workerTimeouts = new Map<string, number>();
	if (inspectingOperation) {
		for (const worker of tasks) {
			workerTimeouts.set(worker.id, worker.timeoutMs);
		}
	}

	return (
		<Tabs
			value={tab}
			onValueChange={(value) => {
				const next = WORKER_TABS.find((candidate) => candidate === value);
				if (next !== undefined) onTabChange(next);
			}}
			className="flex flex-col gap-6"
		>
			<TabsList className="grid h-12 w-full max-w-xl grid-cols-3 rounded-xl border border-border/60 bg-muted/40 p-1.5 max-sm:h-14 max-sm:max-w-full">
				<TabsTrigger value="scheduled" className="flex items-center gap-2 rounded-lg font-semibold text-sm">
					<CalendarClock className="size-4" />
					<span>{m.admin_workers_scheduled_tab()}</span>
					<Badge variant="secondary" className="px-1.5 py-0 font-mono text-[10px]">
						{tasks.length}
					</Badge>
				</TabsTrigger>
				<TabsTrigger value="activity" className="flex items-center gap-2 rounded-lg font-semibold text-sm">
					<ListTree className="size-4" />
					<span>{m.admin_workers_activity_tab()}</span>
					{activeOperations.length > 0 ? (
						<Badge variant="default" className="bg-primary px-1.5 py-0 font-mono text-[10px] text-primary-foreground">
							{activeOperations.length}
						</Badge>
					) : (
						<Badge variant="secondary" className="px-1.5 py-0 font-mono text-[10px]">
							{0}
						</Badge>
					)}
				</TabsTrigger>
				<TabsTrigger value="history" className="flex items-center gap-2 rounded-lg font-semibold text-sm">
					<History className="size-4" />
					<span>{m.admin_workers_history_tab()}</span>
				</TabsTrigger>
			</TabsList>

			<TabsContent value="scheduled" className="flex flex-col gap-6 pt-1">
				<WorkerScheduledTasksTab
					autoRefresh={autoRefresh}
					tasks={tasks}
					isLoading={statsQuery.isLoading}
					isError={statsQuery.isError}
					activeOperations={activeOperations}
				/>
			</TabsContent>

			<Suspense fallback={TAB_FALLBACK}>
				<TabsContent value="activity" className="flex flex-col gap-6 pt-1">
					<LazyWorkerActivityTab
						autoRefresh={autoRefresh}
						activeOperations={activeOperations}
						activeStatus={{ isLoading: activeOperationsQuery.isLoading, isError: activeOperationsQuery.isError }}
						onInspect={setInspectingOperation}
					/>
				</TabsContent>
			</Suspense>

			<Suspense fallback={TAB_FALLBACK}>
				<TabsContent value="history" className="flex flex-col gap-6 pt-1">
					<LazyWorkerHistoryTab autoRefresh={autoRefresh} onInspect={setInspectingOperation} />
				</TabsContent>
			</Suspense>

			<WorkerOperationDialog
				operation={inspectingOperation}
				workerTimeouts={workerTimeouts}
				isOpen={Boolean(inspectingOperation)}
				onClose={() => setInspectingOperation(null)}
				onRefresh={() => {
					detach(queryClient.invalidateQueries({ queryKey: adminKeys.workerOperations() }));
				}}
			/>
		</Tabs>
	);
}
