import { ReelVaultError } from "@reelvault/sdk/client";
import { useAdminDashboardView } from "@/client/hooks/use-admin-dashboard-view";
import { useAdminLibraries } from "@/client/hooks/use-libraries";
import { AppErrorState } from "@/components/app-states";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
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
	const stats = dashboardViewQuery.data?.stats;

	const { libraries } = useAdminLibraries();

	// Server <= 1.1 has no dashboard-view route (404) — the composite requires
	// a matching 1.2 server; the rest of the admin panel keeps working.
	if (dashboardViewQuery.isError) {
		const error = dashboardViewQuery.error;
		const isServerTooOld = error instanceof ReelVaultError && error.status === 404;

		return (
			<div className="flex flex-col gap-6">
				{isServerTooOld ? (
					<AppErrorState
						title={m.admin_dashboard_server_too_old()}
						description={m.user_check_server_connection()}
						onRetry={() => detach(dashboardViewQuery.refetch())}
					/>
				) : (
					<AppErrorState
						title={m.admin_dashboard_failed_to_fetch_data()}
						error={error}
						onRetry={() => detach(dashboardViewQuery.refetch())}
					/>
				)}
			</div>
		);
	}

	if (dashboardViewQuery.isPending) {
		return (
			<div className="flex flex-col gap-6" role="status" aria-busy="true">
				<div className="bg-muted/60 h-24 animate-pulse rounded-xl" />
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
					<div className="bg-muted/60 h-40 animate-pulse rounded-xl" />
					<div className="bg-muted/60 h-40 animate-pulse rounded-xl" />
					<div className="bg-muted/60 h-40 animate-pulse rounded-xl" />
				</div>
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
					<div className="bg-muted/60 h-64 animate-pulse rounded-xl" />
					<div className="bg-muted/60 h-64 animate-pulse rounded-xl" />
					<div className="bg-muted/60 h-64 animate-pulse rounded-xl" />
				</div>
			</div>
		);
	}

	const totalMediaFiles = stats?.media?.totalFiles ?? 0;
	const totalMediaSize = stats?.media?.totalSize ?? 0;

	const activeJobs = stats?.workers?.active ?? 0;
	const waitingJobs = stats?.workers?.waiting ?? 0;
	const failedJobs = stats?.workers?.failed ?? 0;

	return (
		<div className="flex flex-col gap-6">
			<DashboardHeader libraries={libraries} />

			<DashboardKpiStats
				stats={stats}
				totalMediaSize={totalMediaSize}
				activeJobs={activeJobs}
				waitingJobs={waitingJobs}
				failedJobs={failedJobs}
			/>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<DashboardServerResources stats={stats} />

				<DashboardStorageBreakdown libraries={libraries} totalMediaFiles={totalMediaFiles} totalMediaSize={totalMediaSize} />

				<DashboardUpdateStatus />
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<DashboardWorkerQueue />
				<DashboardAuditFeed />
				<DashboardErrorLogs />
			</div>
		</div>
	);
}
