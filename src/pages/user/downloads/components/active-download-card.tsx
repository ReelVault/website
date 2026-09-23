import { Loader2 } from "lucide-react";
import type { DownloadJob } from "@reelvault/sdk";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

/** Active download card (1.5 s polling comes from the page — here it is presentation only). */
export function ActiveDownloadCard({ job, onDelete }: { job: DownloadJob; onDelete: (jobId: string) => void }) {
	return (
		<div className="flex flex-col gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-5 shadow-xs transition-colors">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex min-w-0 items-center gap-3.5">
					<div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
						<Loader2 className="size-5 animate-spin" />
					</div>
					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-2">
							<h2 className="truncate font-bold text-foreground text-sm">{job.fileName}</h2>
							<Badge size="sm" variant="secondary" className="font-mono text-[10px] uppercase">
								{job.quality}
							</Badge>
						</div>
						<p className="text-muted-foreground text-xs">
							{job.status === "processing" ? m.user_transcoding_in_progress_dots() : m.user_queued_in_queue()}
						</p>
					</div>
				</div>

				<div className="flex shrink-0 items-center gap-2">
					<Button variant="ghost" size="sm" onClick={() => onDelete(job.id)} className="text-destructive text-xs hover:bg-destructive/10">
						{m.common_cancel()}
					</Button>
				</div>
			</div>

			<div className="flex flex-col gap-1.5">
				<div className="h-2 w-full overflow-hidden rounded-full bg-muted">
					<div className="h-full bg-primary transition-[width] duration-500" style={{ width: `${Math.max(job.progressPercent, 2)}%` }} />
				</div>
				<div className="flex justify-between font-mono text-[11px] text-muted-foreground">
					<span>{m.user_progress_ffmpeg()}</span>
					<span>{m.common_percent_value({ value: Math.round(job.progressPercent) })}</span>
				</div>
			</div>
		</div>
	);
}
