import { Link } from "@tanstack/react-router";
import { Download, HardDrive, RefreshCw, Settings, Trash2 } from "lucide-react";
import { useAdminDeleteDownloadJob, useAdminDownloadJobs } from "@/client/hooks/use-downloads";
import { AppEmptyState, AppErrorState, AppLoadingState } from "@/components/app-states";
import { ConfirmAction } from "@/components/confirm-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { detach } from "@/lib/detach";
import { AdminPageHeader, AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { formatFileSize } from "@/utils/file-utils";
import { formatDateTime } from "@/utils/format-utils";
import { toast } from "@/utils/toast-facade";
import { toastError } from "@/utils/toast-utils";

export default function AdminDownloadsPage() {
	const { data: downloads = [], isLoading, isError, error, refetch } = useAdminDownloadJobs();
	const deleteMutation = useAdminDeleteDownloadJob();

	const handleDelete = async (jobId: string) => {
		try {
			await deleteMutation.mutateAsync(jobId);
			toast.success(m.admin_downloads_job_deleted());
		} catch (err) {
			toastError(m.admin_downloads_failed_to_delete(), err);
		}
	};

	if (isLoading) {
		return <AppLoadingState label={m.admin_downloads_loading()} className="min-h-96" />;
	}

	if (isError) {
		return (
			<AppErrorState
				title={m.admin_downloads_loading_error()}
				description={m.admin_downloads_failed_to_fetch_list()}
				error={error}
				onRetry={() => {
					detach(refetch());
				}}
			/>
		);
	}

	const activeDownloads: typeof downloads = [];
	const completedDownloads: typeof downloads = [];
	for (const d of downloads) {
		if (d.status === "completed") {
			completedDownloads.push(d);
		} else if (d.status === "pending" || d.status === "processing") {
			activeDownloads.push(d);
		}
	}

	return (
		<div className="space-y-6 text-foreground">
			<AdminPageHeader
				icon={Download}
				eyebrow={m.admin_settings_tab_system()}
				title={m.admin_downloads_heading()}
				description={m.admin_downloads_description()}
				actions={
					<div className="flex flex-wrap items-center gap-2">
						<Button variant="outline" size="sm" nativeButton={false} render={<Link to="/admin/settings" />} className="gap-1.5 text-xs">
							<Settings className="size-3.5" />
							{m.admin_downloads_settings()}
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								detach(refetch());
							}}
							className="gap-1.5 text-xs"
						>
							<RefreshCw className="size-3.5" />
							{m.common_refresh()}
						</Button>
					</div>
				}
			/>

			{/* Statistics */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<Card className="rounded-2xl border-border/60 bg-card/60 shadow-xs">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="font-medium text-muted-foreground text-sm">{m.admin_downloads_active_jobs()}</CardTitle>
						<Download className="size-4 text-primary" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">{activeDownloads.length}</div>
						<p className="text-muted-foreground text-xs">{m.admin_downloads_processing_hint()}</p>
					</CardContent>
				</Card>

				<Card className="rounded-2xl border-border/60 bg-card/60 shadow-xs">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="font-medium text-muted-foreground text-sm">{m.admin_downloads_finished_files()}</CardTitle>
						<HardDrive className="size-4 text-success" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">{completedDownloads.length}</div>
						<p className="text-muted-foreground text-xs">{m.admin_downloads_processed_files()}</p>
					</CardContent>
				</Card>

				<Card className="rounded-2xl border-border/60 bg-card/60 shadow-xs">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="font-medium text-muted-foreground text-sm">{m.admin_downloads_total_jobs()}</CardTitle>
						<Download className="size-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">{downloads.length}</div>
						<p className="text-muted-foreground text-xs">{m.admin_downloads_all_user_jobs()}</p>
					</CardContent>
				</Card>
			</div>

			{/* Job list */}
			<AdminSection title={m.admin_downloads_job_queue()} description={m.admin_downloads_current_and_finished_files()}>
				{downloads.length === 0 ? (
					<AppEmptyState title={m.admin_downloads_no_jobs()} description={m.admin_downloads_empty()} />
				) : (
					<div className="divide-y divide-border/40 rounded-xl border border-border/60 bg-card/40">
						{downloads.map((job) => {
							let statusVariant: "default" | "destructive" | "secondary" = "secondary";
							if (job.status === "completed") {
								statusVariant = "default";
							} else if (job.status === "failed") {
								statusVariant = "destructive";
							}

							return (
								<div key={job.id} className="flex items-center justify-between p-4">
									<div className="flex flex-col gap-1">
										<div className="flex flex-wrap items-center gap-2">
											<span className="font-medium text-sm">{job.fileName ?? job.id}</span>
											<Badge variant={statusVariant}>{job.status}</Badge>
											<Badge variant="outline" className="text-xs">
												{job.quality}
											</Badge>
											<span className="font-mono text-muted-foreground text-xs">
												{m.admin_downloads_profile_label({ id: job.profileId })}
											</span>
										</div>
										<div className="flex items-center gap-3 text-muted-foreground text-xs">
											{job.sizeBytes && (
												<span>
													{m.common_size_label()} {formatFileSize(job.sizeBytes)}
												</span>
											)}
											<span>{m.admin_downloads_progress({ progressPercent: job.progressPercent })}</span>
											<span>
												{m.common_created_label()} {formatDateTime(job.createdAt)}
											</span>
										</div>
										{job.errorText && <p className="text-destructive text-xs">{job.errorText}</p>}
									</div>
									<ConfirmAction
										trigger={
											<Button
												variant="ghost"
												size="icon-sm"
												aria-label={m.admin_logs_delete_file()}
												className="text-muted-foreground hover:text-destructive"
											>
												<Trash2 className="size-4" />
											</Button>
										}
										title={m.admin_downloads_delete_job_confirm()}
										description={m.admin_downloads_file_removal_notice()}
										confirmLabel={m.admin_downloads_delete_job()}
										onConfirm={() => {
											detach(handleDelete(job.id));
										}}
									/>
								</div>
							);
						})}
					</div>
				)}
			</AdminSection>
		</div>
	);
}
