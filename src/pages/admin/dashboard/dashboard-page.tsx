import { useAdminDashboardView } from "@/client/hooks/use-admin-dashboard-view";
import { useAdminLibraries } from "@/client/hooks/use-libraries";
import { detach } from "@/lib/detach";
import { DashboardAuditFeed } from "./components/dashboard-audit-feed";
import { DashboardErrorLogs } from "./components/dashboard-error-logs";
import { DashboardHeader } from "./components/dashboard-header";
import { DashboardKpiStats } from "./components/dashboard-kpi-stats";
import { DashboardServerResources } from "./components/dashboard-server-resources";
import { DashboardStorageBreakdown } from "./components/dashboard-storage-breakdown";
import { DashboardUpdateStatus } from "./components/dashboard-update-status";
import { DashboardWorkerQueue } from "./components/dashboard-worker-queue";

export default function AdminDashboardPage() {
	// ONE composite request; its response seeds the individual hook caches
	// below before they mount, so the child sections issue no fetches of their
	// own on a warm composite.
	const dashboardViewQuery = useAdminDashboardView();
	const statsQuery = { data: dashboardViewQuery.data?.stats, isPending: dashboardViewQuery.isPending, isError: dashboardViewQuery.isError };
	const stats = statsQuery.data;

	const { libraries, scanLibrary } = useAdminLibraries();

	if (dashboardViewQuery.isPending) {
		return (
			<div className="flex flex-col gap-6" role="status" aria-label="Dashboard loading">
				<div className="h-24 animate-pulse rounded-xl bg-muted/60" />
				<div className="grid gap-6 lg:grid-cols-3">
					<div className="h-40 animate-pulse rounded-xl bg-muted/60" />
					<div className="h-40 animate-pulse rounded-xl bg-muted/60" />
					<div className="h-40 animate-pulse rounded-xl bg-muted/60" />
				</div>
				<div className="grid gap-6 lg:grid-cols-3">
					<div className="h-64 animate-pulse rounded-xl bg-muted/60" />
					<div className="h-64 animate-pulse rounded-xl bg-muted/60" />
					<div className="h-64 animate-pulse rounded-xl bg-muted/60" />
				</div>
			</div>
		);
	}

	const handleRefetchStats = () => {
		detach(dashboardViewQuery.refetch());
	};

	// Server media and queue data from the database
	const totalMediaFiles = stats?.media?.totalFiles ?? 0;
	const totalMediaSize = stats?.media?.totalSize ?? 0;

	const activeJobs = stats?.workers?.active ?? 0;
	const waitingJobs = stats?.workers?.waiting ?? 0;
	const failedJobs = stats?.workers?.failed ?? 0;

	return (
		<div className="flex flex-col gap-6">
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

				<DashboardUpdateStatus />
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
