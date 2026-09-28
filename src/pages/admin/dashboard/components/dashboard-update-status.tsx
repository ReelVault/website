import { Link } from "@tanstack/react-router";
import { ArrowUpCircle, CheckCircle2, Monitor, Server } from "lucide-react";
import type { ReactNode } from "react";
import { useAdminUpdate } from "@/client/hooks/use-admin-update";
import { AppErrorState } from "@/components/app-states";
import { AsyncButton } from "@/components/async-button";
import { Badge } from "@/components/ui/badge";
import { SkeletonList } from "@/components/ui/skeleton";
import { detach } from "@/lib/detach";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";

const JOB_STATE_LABELS: Record<string, () => string> = {
	downloading: m.admin_updates_job_downloading,
	verifying: m.admin_updates_job_verifying,
	extracting: m.admin_updates_job_extracting,
	swapping: m.admin_updates_job_swapping,
	restarting: m.admin_updates_job_restarting,
};

/**
 * Compact dashboard card: current server/UI versions and a prominent CTA when
 * a newer release is available. Server updates take priority; when only the
 * web UI has a new release, its install is one click away too.
 */
export function DashboardUpdateStatus() {
	const { status, statusQuery, install, isInstalling } = useAdminUpdate();

	const serverUpdate = status?.serverUpdateAvailable && status.installType === "archive" ? status.serverLatest : undefined;
	const webUpdate =
		status?.webUpdateAvailable && !status.webRequiresServerUpdate && status.installType === "archive" ? status.webLatest : undefined;

	let content: ReactNode;
	if (statusQuery.isLoading) {
		content = <SkeletonList count={2} itemClassName="h-10" className="flex flex-col gap-3" />;
	} else if (statusQuery.isError || !status) {
		content = <AppErrorState error={statusQuery.error} onRetry={() => detach(statusQuery.refetch())} />;
	} else if (status.job) {
		content = (
			<div className="flex items-center gap-2 text-sm">
				<span className="size-2 animate-pulse rounded-full bg-primary" />
				<span className="font-medium text-foreground">
					{m.admin_updates_job_state_label({
						component: status.job.target === "server" ? m.admin_updates_server_component() : m.admin_updates_web_component(),
						state: JOB_STATE_LABELS[status.job.state]?.() ?? status.job.state,
					})}
				</span>
			</div>
		);
	} else if (serverUpdate || webUpdate) {
		const primary = serverUpdate ?? webUpdate;
		content = (
			<div className="flex flex-col gap-3">
				<div className="flex items-center gap-2 text-sm">
					<ArrowUpCircle className="size-4 text-warning" />
					<span className="font-medium text-foreground">
						{m.admin_updates_update_available({ version: primary?.version ?? "" })}
						{serverUpdate && webUpdate ? m.admin_updates_both_available() : ""}
					</span>
				</div>
				{primary === serverUpdate ? (
					<AsyncButton
						type="button"
						size="sm"
						onClick={() => detach(install("server"))}
						isPending={isInstalling}
						pendingLabel={m.admin_updates_installing()}
					>
						{m.admin_updates_install({ version: serverUpdate?.version ?? "" })}
					</AsyncButton>
				) : (
					<AsyncButton
						type="button"
						size="sm"
						onClick={() => detach(install("web"))}
						isPending={isInstalling}
						pendingLabel={m.admin_updates_installing()}
					>
						{m.admin_updates_install({ version: webUpdate?.version ?? "" })}
					</AsyncButton>
				)}
			</div>
		);
	} else {
		content = (
			<div className="flex items-center gap-2 text-sm">
				<CheckCircle2 className="size-4 text-success" />
				<span className="text-muted-foreground">{m.admin_updates_up_to_date()}</span>
			</div>
		);
	}

	return (
		<AdminSection
			title={m.admin_updates_dashboard_title()}
			description={m.admin_updates_dashboard_description()}
			actions={
				<Link to="/admin/updates" className="text-muted-foreground text-xs hover:text-foreground hover:underline">
					{m.admin_updates_details()}
				</Link>
			}
		>
			<div className="p-4">
				<div className="flex flex-col gap-2">
					{content}
					<div className="mt-1 flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
						<span className="flex items-center gap-1.5">
							<Server className="size-3.5" />
							{status?.serverVersion ?? "—"}
						</span>
						<span className="flex items-center gap-1.5">
							<Monitor className="size-3.5" />
							{status?.webVersion ?? "—"}
						</span>
						{serverUpdate && (
							<Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning">
								{m.admin_updates_new_version_short({ version: serverUpdate.version })}
							</Badge>
						)}
						{webUpdate && (
							<Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning">
								{m.admin_updates_new_version_short({ version: webUpdate.version })}
							</Badge>
						)}
					</div>
				</div>
			</div>
		</AdminSection>
	);
}
