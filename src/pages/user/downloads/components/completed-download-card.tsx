import type { DownloadJob } from "@reelvault/sdk";
import { Check, Download, Trash2 } from "lucide-react";
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
		<div className="border-border/70 bg-card/70 hover:border-primary/40 hover:bg-card flex flex-col gap-4 rounded-2xl border p-5 transition-[border-color,background-color] sm:flex-row sm:items-center sm:justify-between">
			<div className="flex min-w-0 items-center gap-4">
				<div className="bg-success/10 text-success flex size-12 shrink-0 items-center justify-center rounded-2xl">
					<Check className="size-5" />
				</div>
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-2">
						<h2 className="text-foreground truncate text-sm font-bold">{job.fileName}</h2>
						<Badge size="sm" variant="outline" font="mono">
							{job.quality}
						</Badge>
						<span className="bg-success/10 text-success rounded-full px-2 py-0.5 text-xs font-bold">{m.user_download_status_ready()}</span>
					</div>
					<p className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-xs">
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
					className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold shadow-xs transition-colors"
				>
					<Download className="size-3.5" />
					{m.components_offline_download_mp4()}
				</a>
				<ConfirmAction
					trigger={
						<Button tone="muted" variant="ghost" size="icon" title={m.user_delete_from_server()}>
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
