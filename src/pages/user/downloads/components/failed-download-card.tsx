import { Trash2 } from "lucide-react";
import type { DownloadJob } from "reelvault-sdk";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

/** Card for a failed / cancelled download. */
export function FailedDownloadCard({ job, onDelete }: { job: DownloadJob; onDelete: (jobId: string) => void }) {
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

			<Button variant="ghost" size="sm" onClick={() => onDelete(job.id)} className="text-muted-foreground text-xs hover:text-foreground">
				{m.user_delete_entry()}
			</Button>
		</div>
	);
}
