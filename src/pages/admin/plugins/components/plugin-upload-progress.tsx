import { CheckCircle2, Circle, Loader2, X, XCircle } from "lucide-react";
import type { PluginArchiveEntry, PluginArchiveSummary } from "@/client/hooks/use-plugin-catalog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { m } from "@/paraglide/messages";

export function formatBytes(bytes: number): string {
	if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

	if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;

	return `${bytes} B`;
}

function statusLabel(entry: PluginArchiveEntry): string {
	switch (entry.status) {
		case "queued":
			return m.admin_plugins_upload_status_queued();
		case "uploading":
			return m.admin_plugins_upload_status_uploading();
		case "installing":
			return m.admin_plugins_upload_status_installing();
		case "installed":
			return m.admin_plugins_upload_status_installed();
		case "failed":
			return m.admin_plugins_upload_status_failed();
		default:
			return m.admin_plugins_upload_status_failed();
	}
}

function StatusIcon({ entry }: { entry: PluginArchiveEntry }) {
	switch (entry.status) {
		case "uploading":
		case "installing":
			return <Loader2 className="size-4 animate-spin text-primary" aria-hidden="true" />;
		case "installed":
			return <CheckCircle2 className="size-4 text-emerald-500" aria-hidden="true" />;
		case "queued":
			return <Circle className="size-4 text-muted-foreground" aria-hidden="true" />;
		case "failed":
			return <XCircle className="size-4 text-destructive" aria-hidden="true" />;
		default:
			return <XCircle className="size-4 text-destructive" aria-hidden="true" />;
	}
}

interface PluginUploadProgressProps {
	entries: PluginArchiveEntry[];
	summary: PluginArchiveSummary | null;
	onClose: () => void;
}

/**
 * Fixed bottom-right card tracking a plugin archive upload batch: overall
 * progress + ETA, per-file status, and inline errors. Stays visible (with a
 * close button) after the batch finishes so failures can be reviewed.
 */
export function PluginUploadProgress({ entries, summary, onClose }: PluginUploadProgressProps) {
	if (entries.length === 0) return null;

	const isRunning = summary !== null && summary.doneCount < summary.total;

	return (
		<div className="fixed right-4 bottom-4 z-90 flex w-90 max-w-[calc(100vw-2rem)] flex-col gap-3 rounded-2xl border border-border bg-popover/95 p-4 shadow-2xl shadow-black/30 backdrop-blur">
			<div className="flex items-center justify-between gap-2">
				<span className="font-bold text-foreground text-sm">
					{m.admin_plugins_upload_panel_title()}
					{summary && (
						<span className="ml-2 font-mono text-muted-foreground">
							{m.admin_plugins_upload_files_counter({ done: summary.doneCount, total: summary.total })}
						</span>
					)}
				</span>
				{!isRunning && (
					<Button type="button" variant="ghost" size="icon-sm" onClick={onClose} aria-label={m.common_close()}>
						<X className="size-4" />
					</Button>
				)}
			</div>

			{summary && (
				<Progress value={summary.overallPercent} aria-label={m.common_progress()} className="w-full gap-1.5">
					<div className="flex w-full justify-between gap-1 font-medium text-muted-foreground text-xs">
						<span>
							{m.admin_plugins_upload_overall_stats({
								percent: summary.overallPercent,
								uploaded: formatBytes(summary.uploadedBytes),
								total: formatBytes(summary.totalBytes),
							})}
						</span>
						{summary.etaSeconds !== null && (
							<span className="font-bold text-primary">{m.admin_plugins_upload_eta({ seconds: summary.etaSeconds })}</span>
						)}
					</div>
				</Progress>
			)}

			<div className="flex max-h-60 flex-col gap-2 overflow-y-auto">
				{entries.map((entry) => {
					const isCurrent = summary?.currentEntry?.id === entry.id;

					return (
						<div key={entry.id} className="flex flex-col gap-1">
							<div className="flex items-center gap-2">
								<StatusIcon entry={entry} />
								<span className="min-w-0 flex-1 truncate font-medium text-foreground text-xs" title={entry.file.name}>
									{entry.file.name}
								</span>
								<span className="shrink-0 font-mono text-[11px] text-muted-foreground">{formatBytes(entry.file.size)}</span>
							</div>
							<div className="flex items-center justify-between gap-2 pl-6">
								<span className={entry.status === "failed" ? "text-[11px] text-destructive" : "text-[11px] text-muted-foreground"}>
									{statusLabel(entry)}
								</span>
								{isCurrent && entry.totalBytes > 0 && entry.status === "uploading" && (
									<span className="font-mono text-[11px] text-muted-foreground">
										{m.common_percent_value({ value: Math.round((entry.uploadedBytes / entry.totalBytes) * 100) })}
									</span>
								)}
							</div>
							{entry.error && (
								<span className="break-words rounded-md bg-destructive/10 px-2 py-1 text-[11px] text-destructive">{entry.error}</span>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
