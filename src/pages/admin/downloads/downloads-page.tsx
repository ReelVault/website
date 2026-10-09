import { Link } from "@tanstack/react-router";
import { Download, HardDrive, RefreshCw, Settings, Trash2 } from "lucide-react";
import { useState } from "react";
import { useAdminDeleteDownloadJob, useAdminDownloadJobs } from "@/client/hooks/use-downloads";
import { AppEmptyState, AppErrorState, AppLoadingState } from "@/components/app-states";
import { ConfirmAction } from "@/components/confirm-action";
import { SimplePagination } from "@/components/simple-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { detach } from "@/lib/detach";
import { AdminPageHeader, AdminSection, AdminStatCard } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { formatFileSize } from "@/utils/file-utils";
import { formatDateTime } from "@/utils/format-utils";
import { toast } from "@/utils/toast-facade";
import { toastError } from "@/utils/toast-utils";
import { translateCode } from "@/utils/translate-error";

type StatusFilter = "all" | "pending" | "processing" | "completed" | "failed" | "cancelled";

const STATUS_FILTERS: readonly StatusFilter[] = ["all", "pending", "processing", "completed", "failed", "cancelled"];
const NO_COUNTS = { pending: 0, processing: 0, completed: 0, failed: 0, cancelled: 0 };

export default function AdminDownloadsPage() {
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [page, setPage] = useState(1);
	const pageQuery = useAdminDownloadJobs({ page, status: statusFilter === "all" ? undefined : statusFilter });
	const { data, isLoading, isFetching, isError, error, refetch } = pageQuery;
	const deleteMutation = useAdminDeleteDownloadJob();
	const downloads = data?.data ?? [];
	// The counters come from the server, so they cover every job rather than the page on screen.
	const counts = data?.counts ?? NO_COUNTS;
	const activeCount = counts.pending + counts.processing;
	const totalCount = counts.pending + counts.processing + counts.completed + counts.failed + counts.cancelled;

	const handleStatusChange = (next: StatusFilter) => {
		setStatusFilter(next);
		setPage(1);
	};

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

	return (
		<div className="flex flex-col gap-6">
			<AdminPageHeader
				icon={Download}
				eyebrow={m.admin_sidebar_operations()}
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
			<div className="grid gap-3 sm:grid-cols-3">
				<AdminStatCard
					label={m.admin_downloads_active_jobs()}
					value={activeCount}
					icon={Download}
					description={m.admin_downloads_processing_hint()}
				/>
				<AdminStatCard
					label={m.admin_downloads_finished_files()}
					value={counts.completed}
					icon={HardDrive}
					tone="success"
					description={m.admin_downloads_processed_files()}
				/>
				<AdminStatCard
					label={m.admin_downloads_total_jobs()}
					value={totalCount}
					icon={Download}
					tone="muted"
					description={m.admin_downloads_all_user_jobs()}
				/>
			</div>

			{/* Job list */}
			<AdminSection title={m.admin_downloads_job_queue()} description={m.admin_downloads_current_and_finished_files()}>
				<ToggleGroup
					multiple={false}
					value={[statusFilter]}
					onValueChange={(value) => {
						const next = STATUS_FILTERS.find((candidate) => candidate === value[0]);
						if (next) handleStatusChange(next);
					}}
					variant="outline"
					size="sm"
					className="mb-3 flex-wrap"
				>
					{STATUS_FILTERS.map((option) => (
						<ToggleGroupItem key={option} value={option} className="text-xs">
							{option === "all" ? m.common_all() : option}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
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
										{job.errorCode && <p className="text-destructive text-xs">{translateCode(job.errorCode, m.download_failed())}</p>}
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
				<SimplePagination
					variant="admin"
					currentPage={page}
					totalPages={data?.totalPages ?? 1}
					isLoading={isFetching}
					onPageChange={setPage}
				/>
			</AdminSection>
		</div>
	);
}
