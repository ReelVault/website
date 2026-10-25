import type { DownloadJob } from "@reelvault/sdk";
import { Link } from "@tanstack/react-router";
import { RotateCcw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";
import { translateCode } from "@/utils/translate-error";

/** Card for a failed / cancelled download; retry queues the same file and quality again. */
export function FailedDownloadCard({
	job,
	onDelete,
	onRetry,
	isRetrying,
}: {
	job: DownloadJob;
	onDelete: (jobId: string) => void;
	onRetry: (jobId: string) => void;
	isRetrying: boolean;
}) {
	return (
		<div className="border-border/60 bg-muted/20 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex min-w-0 items-center gap-3">
				<div className="bg-destructive/10 text-destructive flex size-9 shrink-0 items-center justify-center rounded-xl">
					<Trash2 className="size-4" />
				</div>
				<div className="min-w-0">
					<div className="flex items-center gap-2">
						<p className="truncate text-xs font-semibold">{job.fileName}</p>
						<Badge size="sm" variant="destructive">
							{job.status === "cancelled" ? m.common_cancelled() : m.common_error()}
						</Badge>
					</div>
					{job.errorCode && <p className="text-destructive truncate text-xs">{translateCode(job.errorCode, m.download_failed())}</p>}
				</div>
			</div>

			<div className="flex items-center gap-2">
				{job.metadataId && (
					<Button variant="ghost" size="sm" nativeButton={false} render={<Link to="/details/$id" params={{ id: job.metadataId }} />}>
						{m.user_open_title()}
					</Button>
				)}
				<Button variant="outline" size="sm" disabled={isRetrying} onClick={() => onRetry(job.id)}>
					<RotateCcw className="size-3.5" />
					{m.user_retry_download()}
				</Button>
				<Button tone="muted" variant="ghost" size="sm" onClick={() => onDelete(job.id)}>
					{m.user_delete_entry()}
				</Button>
			</div>
		</div>
	);
}
