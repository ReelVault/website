import { useAdminStats } from "@/client/hooks/use-admin-stats";
import { useAdminLibraries } from "@/client/hooks/use-libraries";
import { detach } from "@/lib/detach";
import { DashboardAuditFeed } from "./components/dashboard-audit-feed";
import { DashboardErrorLogs } from "./components/dashboard-error-logs";
import { DashboardHeader } from "./components/dashboard-header";
import { DashboardKpiStats } from "./components/dashboard-kpi-stats";
import { DashboardServerResources } from "./components/dashboard-server-resources";
import { DashboardStorageBreakdown } from "./components/dashboard-storage-breakdown";
import { DashboardWorkerQueue } from "./components/dashboard-worker-queue";

export default function AdminDashboardPage() {
	const statsQuery = useAdminStats();
	const stats = statsQuery.data;

	const { libraries, scanLibrary } = useAdminLibraries();

	const handleRefetchStats = () => {
		detach(statsQuery.refetch());
	};

	// Server media and queue data from the database
	const totalMediaFiles = stats?.media?.totalFiles ?? 0;
	const totalMediaSize = stats?.media?.totalSize ?? 0;

	const activeJobs = stats?.workers?.active ?? 0;
	const waitingJobs = stats?.workers?.waiting ?? 0;
	const failedJobs = stats?.workers?.failed ?? 0;

	return (
		<div className="flex flex-col gap-8">
			{/* 1. HEADER WITH QUICK ACTIONS */}
			<DashboardHeader isServerOffline={statsQuery.isError} libraries={libraries} onScanLibrary={scanLibrary} />

			{/* 3. MAIN KPI METRICS */}
			<DashboardKpiStats
				stats={stats}
				totalMediaSize={totalMediaSize}
				activeJobs={activeJobs}
				waitingJobs={waitingJobs}
				failedJobs={failedJobs}
			/>

			{/* 3. RESOURCES AND LIBRARY STRUCTURE */}
			<div className="grid gap-6 lg:grid-cols-3">
				<DashboardServerResources
					stats={stats}
					isPending={statsQuery.isPending}
					isError={statsQuery.isError}
					onRetry={handleRefetchStats}
				/>

				<DashboardStorageBreakdown libraries={libraries} totalMediaFiles={totalMediaFiles} totalMediaSize={totalMediaSize} />
			</div>

			{/* 4. WORKER QUEUE + AUDIT FEED + WARNING LOGS */}
			<div className="grid gap-6 lg:grid-cols-3">
				<DashboardWorkerQueue />
				<DashboardAuditFeed />
				<DashboardErrorLogs />
			</div>
		</div>
	);
}
