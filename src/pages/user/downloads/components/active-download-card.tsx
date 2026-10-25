import type { DownloadJob } from "@reelvault/sdk";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { m } from "@/paraglide/messages";

/** Active download card (1.5 s polling comes from the page — here it is presentation only). */
export function ActiveDownloadCard({ job, onDelete }: { job: DownloadJob; onDelete: (jobId: string) => void }) {
	return (
		<div className="border-primary/30 bg-primary/5 flex flex-col gap-4 rounded-2xl border p-5 shadow-xs transition-colors">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex min-w-0 items-center gap-3.5">
					<div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
						<Spinner size="lg" />
					</div>
					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-2">
							<h2 className="text-foreground truncate text-sm font-bold">{job.fileName}</h2>
							<Badge size="sm" variant="secondary" font="mono">
								{job.quality}
							</Badge>
						</div>
						<p className="text-muted-foreground text-xs">
							{job.status === "processing" ? m.user_transcoding_in_progress_dots() : m.user_queued_in_queue()}
						</p>
					</div>
				</div>

				<div className="flex shrink-0 items-center gap-2">
					<Button variant="destructive-ghost" size="sm" onClick={() => onDelete(job.id)}>
						{m.common_cancel()}
					</Button>
				</div>
			</div>

			<div className="flex flex-col gap-1.5">
				<div className="bg-muted h-2 w-full overflow-hidden rounded-full">
					<div className="bg-primary h-full transition-[width] duration-500" style={{ width: `${Math.max(job.progressPercent, 2)}%` }} />
				</div>
				<div className="text-muted-foreground flex justify-between font-mono text-xs">
					<span>{m.user_progress_ffmpeg()}</span>
					<span>{m.common_percent_value({ value: Math.round(job.progressPercent) })}</span>
				</div>
			</div>
		</div>
	);
}
