import { RefreshCw } from "lucide-react";
import { useDeleteDownload, useUserDownloads } from "@/client/hooks/use-downloads";
import { AppEmptyState, AppErrorState } from "@/components/app-states";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "@/utils/toast-utils";
import { UserPageHeader, UserSectionTitle } from "../components/user-ui";
import { ActiveDownloadCard } from "./components/active-download-card";
import { CompletedDownloadCard } from "./components/completed-download-card";
import { FailedDownloadCard } from "./components/failed-download-card";

export default function DownloadsPage() {
	const { data: downloads = [], isLoading, isError, error, refetch } = useUserDownloads();
	const deleteMutation = useDeleteDownload();

	const handleDelete = async (jobId: string) => {
		try {
			await deleteMutation.mutateAsync(jobId);
			toast.success(m.user_file_deleted_from_server());
		} catch (err) {
			toastError(m.user_failed_to_delete_file(), err);
		}
	};

	const activeDownloads: typeof downloads = [];
	const completedDownloads: typeof downloads = [];
	const failedDownloads: typeof downloads = [];
	for (const d of downloads) {
		if (d.status === "completed") {
			completedDownloads.push(d);
		} else if (d.status === "pending" || d.status === "processing") {
			activeDownloads.push(d);
		} else if (d.status === "failed" || d.status === "cancelled") {
			failedDownloads.push(d);
		}
	}

	const renderDownloadLists = () => {
		if (isLoading) {
			return (
				<div className="flex flex-col gap-4" aria-busy="true">
					{["one", "two", "three"].map((key) => (
						<Skeleton key={key} className="h-28 rounded-2xl" />
					))}
				</div>
			);
		}

		if (isError) {
			return <AppErrorState title={m.user_download_list_fetch_failed()} error={error} onRetry={() => detach(refetch())} />;
		}

		if (downloads.length === 0) {
			return <AppEmptyState title={m.user_no_prepared_files()} description={m.user_no_downloads_yet()} />;
		}

		return (
			<div className="flex flex-col gap-8">
				{/* W TRAKCIE PRZETWARZANIA */}
				{activeDownloads.length > 0 && (
					<section>
						<UserSectionTitle title={m.user_downloads_in_preparation()} description={m.user_files_being_processed()} />
						<div className="flex flex-col gap-3">
							{activeDownloads.map((job) => (
								<ActiveDownloadCard key={job.id} job={job} onDelete={(jobId) => detach(handleDelete(jobId))} />
							))}
						</div>
					</section>
				)}

				{/* GOTOWE DO POBRANIA */}
				{completedDownloads.length > 0 && (
					<section>
						<UserSectionTitle title={m.user_downloads_ready_title()} description={m.user_downloads_ready_desc()} />
						<div className="flex flex-col gap-3">
							{completedDownloads.map((job) => (
								<CompletedDownloadCard key={job.id} job={job} onDelete={(jobId) => detach(handleDelete(jobId))} />
							))}
						</div>
					</section>
				)}

				{/* FAILED / CANCELLED */}
				{failedDownloads.length > 0 && (
					<section>
						<UserSectionTitle title={m.user_history_error()} description={m.user_finished_errored_jobs()} />
						<div className="flex flex-col gap-3">
							{failedDownloads.map((job) => (
								<FailedDownloadCard key={job.id} job={job} onDelete={(jobId) => detach(handleDelete(jobId))} />
							))}
						</div>
					</section>
				)}
			</div>
		);
	};

	return (
		<main className="flex flex-col gap-10 pb-10">
			<UserPageHeader
				eyebrow={m.user_downloads_offline_eyebrow()}
				title={m.user_downloads_heading()}
				description={m.user_browse_downloads_description()}
				action={
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							detach(refetch());
						}}
						className="min-h-11 gap-2"
					>
						<RefreshCw className="size-4" />
						{m.common_refresh()}
					</Button>
				}
			/>

			{renderDownloadLists()}
		</main>
	);
}
