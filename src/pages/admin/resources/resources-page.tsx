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
import { ResourceAggregatesGrid } from "./components/resource-aggregates-section";
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
				{/* Stall-protection: prominent banner while rescuing, slim strip when healthy */}
				<ServerRescueStatus rescue={data.rescue} />

				{/* Current metrics */}
				<ResourceMetricsGrid current={data.current} />

				{/* Monitoring / throttling configuration — compact strip */}
				<ResourceConfigSection config={data.config} />

				{/* 24h history chart + aggregates, the page's primary overview */}
				{data.history.length > 0 && (
					<AdminSection title={m.admin_resources_history_24h()} description={m.admin_resources_load_chart_description()}>
						<div className="flex flex-col gap-4">
							<ResourceHistoryChart history={data.history} />
							<ResourceAggregatesGrid aggregates={data.aggregates} />
						</div>
					</AdminSection>
				)}

				{/* Threshold alerts (renders nothing when there are none) */}
				<ResourceAlertsSection alerts={data.alerts} />

				{/* Compute capacity + per-worker concurrency, side by side */}
				<div className="grid gap-6 lg:grid-cols-2">
					<SystemCpuInfo cpu={data.systemCpu} />
					<WorkerAllocations allocations={data.workerAllocations} />
				</div>

				{/* Storage caches + ffmpeg diagnostics, side by side */}
				<div className="grid gap-6 lg:grid-cols-2">
					<ResourceCacheStats />
					<FfmpegHwaccelDiagnostics />
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
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
