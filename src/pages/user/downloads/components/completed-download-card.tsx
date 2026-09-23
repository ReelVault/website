import { Check, Download, Trash2 } from "lucide-react";
import type { DownloadJob } from "reelvault-sdk";
import { getDownloadFileUrl } from "@/client/hooks/use-downloads";
import { ConfirmAction } from "@/components/confirm-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";
import { formatFileSize } from "@/utils/file-utils";
import { formatDateTime } from "@/utils/format-utils";

/** Card for a ready-to-download MP4 file. */
export function CompletedDownloadCard({ job, onDelete }: { job: DownloadJob; onDelete: (jobId: string) => void }) {
	return (
		<div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/70 p-5 transition-[border-color,background-color] hover:border-primary/40 hover:bg-card sm:flex-row sm:items-center sm:justify-between">
			<div className="flex min-w-0 items-center gap-4">
				<div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-green-500/10 text-green-500">
					<Check className="size-5" />
				</div>
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-2">
						<h2 className="truncate font-bold text-foreground text-sm">{job.fileName}</h2>
						<Badge size="sm" variant="outline" className="font-mono text-[10px] uppercase">
							{job.quality}
						</Badge>
						<span className="rounded-full bg-green-500/10 px-2 py-0.5 font-bold text-[9px] text-green-500 uppercase">
							{m.user_download_status_ready()}
						</span>
					</div>
					<p className="mt-1 flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
						<span>{job.sizeBytes ? formatFileSize(job.sizeBytes) : m.common_file_size_not_available()}</span>
						<span>{m.common_bullet_symbol()}</span>
						<span>{formatDateTime(job.createdAt)}</span>
					</p>
				</div>
			</div>

			<div className="flex shrink-0 items-center gap-2">
				<a
					href={getDownloadFileUrl(job.id)}
					download={job.fileName ?? "video.mp4"}
					className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 font-bold text-primary-foreground text-xs shadow-xs transition-colors hover:bg-primary/90"
				>
					<Download className="size-3.5" />
					{m.components_offline_download_mp4()}
				</a>
				<ConfirmAction
					trigger={
						<Button
							variant="ghost"
							size="icon"
							className="size-10 text-muted-foreground hover:bg-destructive/10 hover:text-destructive sm:size-8"
							title={m.user_delete_from_server()}
						>
							<Trash2 className="size-4" />
						</Button>
					}
					title={m.user_delete_file_confirm()}
					description={m.user_buffered_file_removal()}
					confirmLabel={m.admin_logs_delete_file()}
					onConfirm={() => onDelete(job.id)}
				/>
			</div>
		</div>
	);
}
