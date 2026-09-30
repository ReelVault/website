import type { AdminUpdateStatus, AdminUpdateTarget } from "@reelvault/sdk";
import { Link } from "@tanstack/react-router";
import { ArrowUpCircle, ExternalLink, History, Info, Monitor, RefreshCw, Server } from "lucide-react";
import type { ReactNode } from "react";
import { useAdminUpdate } from "@/client/hooks/use-admin-update";
import { AsyncButton } from "@/components/async-button";
import { ConfirmAction } from "@/components/confirm-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { detach } from "@/lib/detach";
import { AdminPageHeader, AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";

const JOB_STATE_LABELS: Record<string, () => string> = {
	downloading: m.admin_updates_job_downloading,
	verifying: m.admin_updates_job_verifying,
	extracting: m.admin_updates_job_extracting,
	swapping: m.admin_updates_job_swapping,
	restarting: m.admin_updates_job_restarting,
};

function VersionStateBadge({ status, target }: { status: AdminUpdateStatus; target: AdminUpdateTarget }) {
	const isServer = target === "server";
	if (status.job?.target === target) {
		return (
			<Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
				<RefreshCw className="size-3 animate-spin" />
				{JOB_STATE_LABELS[status.job.state]?.() ?? status.job.state}
			</Badge>
		);
	}

	const updateAvailable = isServer ? status.serverUpdateAvailable : status.webUpdateAvailable;
	const latest = isServer ? status.serverLatest : status.webLatest;
	if (updateAvailable) {
		return (
			<Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning">
				<ArrowUpCircle className="size-3" />
				{m.admin_updates_update_available({ version: latest?.version ?? "" })}
			</Badge>
		);
	}

	return (
		<Badge variant="outline" className="border-success/30 bg-success/10 text-success">
			{m.admin_updates_up_to_date()}
		</Badge>
	);
}

function VersionCard({ icon, label, version, badge }: { icon: ReactNode; label: string; version: string | null; badge: ReactNode }) {
	return (
		<AdminSection contentClassName="flex items-center justify-between gap-4 p-5">
			<div className="flex min-w-0 items-center gap-3">
				<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
				<div className="min-w-0">
					<p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">{label}</p>
					<p className="truncate font-semibold text-foreground text-xl tabular-nums">{version ?? m.admin_updates_version_unknown()}</p>
				</div>
			</div>
			{badge}
		</AdminSection>
	);
}

function ComponentSection({ status, target }: { status: AdminUpdateStatus; target: AdminUpdateTarget }) {
	const { install, isInstalling, rollback } = useAdminUpdate();
	const isServer = target === "server";
	const latest = isServer ? status.serverLatest : status.webLatest;
	const updateAvailable = isServer ? status.serverUpdateAvailable : status.webUpdateAvailable;
	const rollbackAvailable = isServer ? status.serverRollbackAvailable : status.webRollbackAvailable;
	const lastError = isServer ? status.serverLastError : status.webLastError;
	const jobRunning = Boolean(status.job);

	// The web release may declare the oldest compatible server version — warn
	// instead of blocking: the admin decides with full information.
	const incompatible =
		!isServer && latest?.minServerVersion !== null && latest?.minServerVersion !== undefined && status.webRequiresServerUpdate;

	return (
		<AdminSection
			title={isServer ? m.admin_updates_server_section() : m.admin_updates_web_section()}
			description={isServer ? m.admin_updates_server_section_description() : m.admin_updates_web_section_description()}
		>
			<div className="flex flex-col gap-4 p-4">
				{incompatible && (
					<div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
						<Info className="mt-0.5 size-4 shrink-0" />
						<p>{m.admin_updates_web_requires_server({ version: latest.minServerVersion ?? "" })}</p>
					</div>
				)}

				<div className="flex flex-wrap items-center gap-2.5">
					<AsyncButton
						type="button"
						onClick={() => {
							detach(install(target));
						}}
						isPending={isInstalling}
						pendingLabel={isServer ? m.admin_updates_installing() : m.admin_updates_installing()}
						disabled={jobRunning || !updateAvailable || incompatible}
					>
						<ArrowUpCircle className="size-4" />
						{updateAvailable ? m.admin_updates_install({ version: latest?.version ?? "" }) : m.admin_updates_up_to_date()}
					</AsyncButton>

					{rollbackAvailable && !jobRunning && (
						<ConfirmAction
							trigger={
								<Button type="button" variant="outline" className="gap-1.5">
									<History className="size-4" />
									{m.admin_updates_rollback()}
								</Button>
							}
							title={m.admin_updates_rollback_confirm_title()}
							description={isServer ? m.admin_updates_rollback_confirm_description() : m.admin_updates_web_rollback_confirm_description()}
							confirmLabel={m.admin_updates_rollback()}
							onConfirm={() => {
								detach(rollback(target));
							}}
						/>
					)}
				</div>

				{lastError && (
					<div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive text-sm">
						<Info className="mt-0.5 size-4 shrink-0" />
						<div>
							<p className="font-medium">{m.admin_updates_check_failed()}</p>
							<p className="text-xs">{lastError}</p>
						</div>
					</div>
				)}

				{latest && (
					<div className="rounded-lg border border-border/60 p-3">
						<div className="flex items-center justify-between gap-3">
							<p className="font-medium text-foreground text-sm">{m.admin_updates_release_notes({ version: latest.version })}</p>
							{latest.url ? (
								<a
									href={latest.url}
									target="_blank"
									rel="noreferrer"
									className="flex shrink-0 items-center gap-1 text-primary text-xs hover:underline"
								>
									<ExternalLink className="size-3.5" />
									{m.admin_updates_github_link()}
								</a>
							) : null}
						</div>
						<p className="mt-2 whitespace-pre-wrap text-muted-foreground text-xs">{latest.notes ?? m.admin_updates_no_release_notes()}</p>
					</div>
				)}
			</div>
		</AdminSection>
	);
}

function JobCard({ status }: { status: AdminUpdateStatus }) {
	const job = status.job;
	if (!job) return null;

	const targetLabel = job.target === "server" ? m.admin_updates_server_component() : m.admin_updates_web_component();

	return (
		<AdminSection className="border-primary/30 bg-primary/5" contentClassName="flex flex-col gap-2 p-5">
			<div className="flex items-center justify-between text-sm">
				<span className="flex items-center gap-2 font-medium">
					<RefreshCw className="size-4 animate-spin text-primary" />
					{m.admin_updates_job_state_label({ component: targetLabel, state: JOB_STATE_LABELS[job.state]?.() ?? job.state })}
					{job.message ? <span className="text-muted-foreground">{m.admin_updates_job_message({ message: job.message })}</span> : null}
				</span>
				<span className="text-muted-foreground tabular-nums">{m.common_percent_value({ value: job.progressPercent })}</span>
			</div>
			<Progress value={job.progressPercent} className="h-2" />
			{job.target === "server" && <p className="text-muted-foreground text-xs">{m.admin_updates_restart_notice()}</p>}
		</AdminSection>
	);
}

export default function AdminUpdatesPage() {
	const { status, statusQuery, checkNow, isChecking } = useAdminUpdate();

	const renderContent = () => {
		if (!status) {
			return <p className="text-muted-foreground text-sm">{m.admin_updates_status_unavailable()}</p>;
		}

		return (
			<div className="flex flex-col gap-6">
				<div className="grid gap-4 lg:grid-cols-2">
					<VersionCard
						icon={<Server className="size-5" />}
						label={m.admin_updates_server_version()}
						version={status.serverVersion}
						badge={<VersionStateBadge status={status} target="server" />}
					/>
					<VersionCard
						icon={<Monitor className="size-5" />}
						label={m.admin_updates_web_version()}
						version={status.webVersion}
						badge={<VersionStateBadge status={status} target="web" />}
					/>
				</div>

				<JobCard status={status} />

				<div className="flex flex-wrap items-center gap-2.5">
					<AsyncButton
						type="button"
						variant="outline"
						onClick={() => {
							detach(checkNow());
						}}
						isPending={isChecking}
						pendingLabel={m.admin_updates_checking()}
					>
						<RefreshCw className="size-4" />
						{m.admin_updates_check_now()}
					</AsyncButton>
				</div>

				<ComponentSection status={status} target="server" />
				<ComponentSection status={status} target="web" />

				{status.installType === "docker" && (
					<div className="flex items-start gap-2 rounded-lg border border-border/60 bg-card/60 p-3 text-sm">
						<Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
						<p className="text-muted-foreground">{m.admin_updates_docker_hint()}</p>
					</div>
				)}

				{status.installType === "dev" && (
					<div className="flex items-start gap-2 rounded-lg border border-border/60 bg-card/60 p-3 text-sm">
						<Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
						<p className="text-muted-foreground">{m.admin_updates_dev_hint()}</p>
					</div>
				)}

				{status.installType === "archive" && (
					<p className="text-muted-foreground text-xs">
						{m.admin_updates_flavor_label({
							flavor: status.flavor === "full" ? m.admin_updates_flavor_full() : m.admin_updates_flavor_default(),
						})}
						{" · "}
						<Link to="/admin/worker" className="hover:underline">
							{m.admin_updates_worker_schedule_link()}
						</Link>
					</p>
				)}
			</div>
		);
	};

	return (
		<div className="flex flex-col gap-6">
			<AdminPageHeader
				icon={RefreshCw}
				eyebrow={m.admin_updates_eyebrow()}
				title={m.admin_updates_page_title()}
				description={m.admin_updates_page_description()}
				actions={
					<AsyncButton
						type="button"
						variant="outline"
						size="sm"
						onClick={() => {
							detach(statusQuery.refetch());
						}}
						isPending={statusQuery.isRefetching}
						pendingLabel={m.common_processing()}
					>
						<RefreshCw className="size-4" />
						{m.common_refresh()}
					</AsyncButton>
				}
			/>
			{renderContent()}
		</div>
	);
}
