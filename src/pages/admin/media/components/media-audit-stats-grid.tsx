import { cn } from "cn";
import { AlertTriangle, CheckCircle2, HardDrive, RefreshCw } from "lucide-react";
import { AsyncButton } from "@/components/async-button";
import { m } from "@/paraglide/messages";

interface MediaAuditStatsGridProps {
	totalFilesChecked: number;
	suspectCount: number;
	isFetching: boolean;
	onRefetch: () => void;
}

export function MediaAuditStatsGrid({ totalFilesChecked, suspectCount, isFetching, onRefetch }: MediaAuditStatsGridProps) {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
			<div className="flex items-center gap-4 rounded-xl border border-border/70 bg-card p-4 shadow-2xs">
				<div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
					<HardDrive className="size-6" />
				</div>
				<div>
					<p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">{m.admin_media_audited_files()}</p>
					<p className="font-bold text-2xl text-foreground">{totalFilesChecked}</p>
				</div>
			</div>

			<div className="flex items-center gap-4 rounded-xl border border-border/70 bg-card p-4 shadow-2xs">
				<div
					className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl", {
						"bg-destructive/10 text-destructive": suspectCount > 0,
						"bg-success/10 text-success": suspectCount <= 0,
					})}
				>
					{suspectCount > 0 ? <AlertTriangle className="size-6" /> : <CheckCircle2 className="size-6" />}
				</div>
				<div>
					<p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">{m.admin_media_suspected_mismatches()}</p>
					<p
						className={cn("font-bold text-2xl", {
							"text-destructive": suspectCount > 0,
							"text-success": suspectCount <= 0,
						})}
					>
						{suspectCount}
					</p>
				</div>
			</div>

			<div className="flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-card p-4 shadow-2xs">
				<div className="flex items-center gap-4">
					<div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
						<CheckCircle2 className="size-6" />
					</div>
					<div>
						<p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">{m.admin_media_confident_matches()}</p>
						<p className="font-bold text-2xl text-foreground">{Math.max(0, totalFilesChecked - suspectCount)}</p>
					</div>
				</div>
				<AsyncButton
					type="button"
					variant="outline"
					size="sm"
					isPending={isFetching}
					pendingLabel="Audyt…"
					onClick={onRefetch}
					className="shrink-0 gap-2 shadow-2xs"
				>
					<RefreshCw className="size-3.5" />
					<span>{m.admin_media_rerun_audit()}</span>
				</AsyncButton>
			</div>
		</div>
	);
}
