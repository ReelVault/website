import { Link } from "@tanstack/react-router";
import { Clock, HardDrive, Play, Zap } from "lucide-react";
import type { AdminStats } from "reelvault-sdk";
import { AdminStatCard } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { formatFileSize } from "@/utils/file-utils";
import { formatUptime } from "./dashboard-utils";

export function DashboardKpiStats({
	stats,
	totalMediaSize,
	activeJobs,
	waitingJobs,
	failedJobs,
}: {
	stats?: AdminStats;
	totalMediaSize: number;
	activeJobs: number;
	waitingJobs: number;
	failedJobs: number;
}) {
	const activeSessions = stats?.streaming.activeSessions ?? 0;

	let jobsTone: "success" | "warning" | "default" = "default";
	if (activeJobs > 0) {
		jobsTone = "success";
	} else if (failedJobs > 0) {
		jobsTone = "warning";
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<Link to="/admin/analytics" className="block transition-transform active:scale-[0.99]">
				<AdminStatCard
					label={m.admin_dashboard_active_video_sessions()}
					value={
						<div className="flex items-center gap-2">
							<span>{activeSessions}</span>
							{activeSessions > 0 ? (
								<span className="relative flex size-2.5">
									<span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
									<span className="relative inline-flex size-2.5 rounded-full bg-success" />
								</span>
							) : null}
						</div>
					}
					icon={Play}
					tone={activeSessions > 0 ? "success" : "default"}
					description={activeSessions > 0 ? m.admin_dashboard_active_playback() : m.admin_dashboard_no_active_streams()}
				/>
			</Link>

			<Link to="/admin/media" className="block transition-transform active:scale-[0.99]">
				<AdminStatCard
					label={m.admin_dashboard_catalog_capacity()}
					value={formatFileSize(totalMediaSize)}
					icon={HardDrive}
					description={m.admin_dashboard_indexed_files_desc({ count: stats?.media?.totalFiles ?? 0 })}
				/>
			</Link>

			<Link to="/admin/worker" className="block transition-transform active:scale-[0.99]">
				<AdminStatCard
					label={m.admin_dashboard_worker_jobs_label()}
					value={
						<div className="flex items-baseline gap-1.5">
							<span className="font-bold text-2xl tabular-nums sm:text-3xl">{activeJobs}</span>
							<span className="text-muted-foreground text-xs">{m.admin_dashboard_active_word()}</span>
							{waitingJobs > 0 && (
								<span className="text-muted-foreground text-xs">{m.admin_dashboard_queued_count({ count: waitingJobs })}</span>
							)}
						</div>
					}
					icon={Zap}
					tone={jobsTone}
					description={failedJobs > 0 ? m.admin_dashboard_failed_jobs_desc({ count: failedJobs }) : m.admin_dashboard_queue_healthy()}
				/>
			</Link>

			<AdminStatCard
				label={m.admin_dashboard_server_uptime()}
				value={stats ? formatUptime(stats.uptime) : "—"}
				icon={Clock}
				description={m.admin_dashboard_since_process_restart()}
			/>
		</div>
	);
}
