import { cn } from "cn";
import { Activity, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { useAdminResources } from "@/client/hooks/use-admin-resources";
import { AppEmptyState, AppErrorState } from "@/components/app-states";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { detach } from "@/lib/detach";
import { AdminPageHeader, AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { FfmpegHwaccelDiagnostics } from "./components/ffmpeg-hwaccel-diagnostics";
import { ResourceAggregatesSection } from "./components/resource-aggregates-section";
import { ResourceAlertsSection } from "./components/resource-alerts-section";
import { ResourceCacheStats } from "./components/resource-cache-stats";
import { ResourceConfigSection } from "./components/resource-config-section";
import { ResourceHistoryChart } from "./components/resource-history-chart";
import { ResourceMetricsGrid } from "./components/resource-metrics-grid";
import { ServerRescueStatus } from "./components/server-rescue-status";
import { SystemCpuInfo } from "./components/system-cpu-info";
import { WorkerAllocations } from "./components/worker-allocations";

const SKELETON_KEYS = ["1", "2", "3", "4"] as const;

export default function AdminResourcesPage() {
	const resourcesQuery = useAdminResources();
	const data = resourcesQuery.data;

	let content: ReactNode;
	if (resourcesQuery.isPending) {
		content = (
			<div className="flex flex-col gap-6">
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{SKELETON_KEYS.map((key) => (
						<Skeleton key={key} className="h-32 rounded-xl" />
					))}
				</div>
				<Skeleton className="h-64 rounded-xl" />
			</div>
		);
	} else if (resourcesQuery.isError) {
		content = (
			<AppErrorState
				title={m.admin_resources_failed_to_fetch_data()}
				error={resourcesQuery.error}
				onRetry={() => detach(resourcesQuery.refetch)}
			/>
		);
	} else if (!data?.current) {
		content = <AppEmptyState title={m.common_no_data_available()} description={m.admin_resources_no_samples_yet()} />;
	} else {
		content = (
			<div className="flex flex-col gap-6">
				{/* Current Metrics */}
				<ResourceMetricsGrid current={data.current} />

				{/* Threshold alerts (renders nothing when there are none) */}
				<ResourceAlertsSection alerts={data.alerts} />

				{/* Monitoring / throttling configuration */}
				<ResourceConfigSection config={data.config} />

				{/* System CPU Info */}
				<SystemCpuInfo cpu={data.systemCpu} />

				{/* Server Rescue Status */}
				<ServerRescueStatus rescue={data.rescue} />

				{/* Worker Allocations */}
				<WorkerAllocations allocations={data.workerAllocations} />

				{/* Resource cache */}
				<ResourceCacheStats />

				{/* FFmpeg */}
				<FfmpegHwaccelDiagnostics />

				{/* Aggregates */}
				<ResourceAggregatesSection aggregates={data.aggregates} />

				{/* History Chart */}
				{data.history.length > 0 && (
					<AdminSection title={m.admin_resources_history_24h()} description={m.admin_resources_load_chart_description()}>
						<ResourceHistoryChart history={data.history} />
					</AdminSection>
				)}
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6 pb-10">
			<AdminPageHeader
				icon={Activity}
				eyebrow={m.admin_resources_eyebrow()}
				title={m.admin_resources_system_section()}
				description={m.admin_resources_monitoring_description()}
				actions={
					<Button
						variant="outline"
						size="sm"
						onClick={() => detach(resourcesQuery.refetch)}
						disabled={resourcesQuery.isFetching}
						className="gap-2 text-xs"
					>
						<RefreshCw className={cn("size-3.5", { "animate-spin": resourcesQuery.isFetching })} />
						{m.common_refresh()}
					</Button>
				}
			/>

			{content}
		</div>
	);
}
