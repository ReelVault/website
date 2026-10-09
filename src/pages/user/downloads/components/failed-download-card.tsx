import type { DownloadJob } from "@reelvault/sdk";
import { Link } from "@tanstack/react-router";
import { RotateCcw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

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
		<div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex min-w-0 items-center gap-3">
				<div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
					<Trash2 className="size-4" />
				</div>
				<div className="min-w-0">
					<div className="flex items-center gap-2">
						<p className="truncate font-semibold text-xs">{job.fileName}</p>
						<Badge size="sm" variant="destructive" className="text-[9px]">
							{job.status === "cancelled" ? m.common_cancelled() : m.common_error()}
						</Badge>
					</div>
					{job.errorText && <p className="truncate text-destructive text-xs">{job.errorText}</p>}
				</div>
			</div>

			<div className="flex items-center gap-2">
				{job.metadataId && (
					<Button
						variant="ghost"
						size="sm"
						nativeButton={false}
						render={<Link to="/details/$id" params={{ id: job.metadataId }} />}
						className="text-xs"
					>
						{m.user_open_title()}
					</Button>
				)}
				<Button variant="outline" size="sm" disabled={isRetrying} onClick={() => onRetry(job.id)} className="gap-1.5 text-xs">
					<RotateCcw className="size-3.5" />
					{m.user_retry_download()}
				</Button>
				<Button variant="ghost" size="sm" onClick={() => onDelete(job.id)} className="text-muted-foreground text-xs hover:text-foreground">
					{m.user_delete_entry()}
				</Button>
			</div>
		</div>
	);
}
