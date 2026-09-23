import type { WorkerOperation } from "@reelvault/sdk";
import { cn } from "cn";
import { Activity, AlertCircle, Check, CheckCircle2, Copy, Layers, ListTree, Play, Sparkles, Square, Volume2, Wrench } from "lucide-react";
import { createElement, type ReactNode } from "react";
import { ConfirmAction } from "@/components/confirm-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { useCopyToClipboard } from "@/utils/clipboard-utils";
import { formatDate, formatMsDuration, getWorkerMeta, labels } from "./worker-utils";

interface WorkerOperationCardProps {
	operation: WorkerOperation;
	selected?: boolean;
	cancelling: boolean;
	resuming?: boolean | undefined;
	resumeOperation?: (operationId: string) => Promise<unknown>;
	onInspect: (operation: WorkerOperation) => void;
	onCancel: (operationId: string) => Promise<unknown>;
}

function getOperationIcon(type: string) {
	if (type.includes("scan") || type.includes("ingest") || type.includes("analysis")) return Layers;

	if (type.includes("image")) return Sparkles;

	if (type.includes("loudness") || type.includes("audio")) return Volume2;

	if (type.includes("error") || type.includes("check")) return Wrench;

	return Activity;
}

function OperationIcon({ type, className }: { type: string; className?: string }) {
	return createElement(getOperationIcon(type), { className });
}

export function WorkerOperationCard({ operation, cancelling, resuming, resumeOperation, onInspect, onCancel }: WorkerOperationCardProps) {
	const { hasCopied, copy } = useCopyToClipboard();
	const isActive = operation.status === "pending" || operation.status === "running";
	const isResumable = operation.status === "cancelled" && operation.cancelledItems > 0 && Boolean(resumeOperation);
	const isRunning = operation.status === "running";
	const isFailed = operation.status === "failed";
	const isCompleted = operation.status === "completed";
	const progress = operation.progressPercent ?? (isCompleted ? 100 : 0);
	const meta = getWorkerMeta(operation.type);

	let statusBadge: ReactNode;
	if (isRunning) {
		statusBadge = (
			<Badge variant="default" className="h-5 gap-1.5 bg-primary px-2 font-medium text-[10px] text-primary-foreground shadow-xs">
				<span className="size-1.5 animate-ping rounded-full bg-white" /> {m.admin_worker_running_badge()}
			</Badge>
		);
	} else if (operation.status === "pending") {
		statusBadge = (
			<Badge variant="secondary" className="h-5 border border-warning/30 bg-warning/10 px-2 text-[10px] text-warning">
				{m.admin_workers_queued()}
			</Badge>
		);
	} else if (isCompleted) {
		statusBadge = (
			<Badge variant="outline" className="h-5 gap-1 border-success/30 bg-success/5 px-2 text-[10px] text-success">
				<CheckCircle2 className="size-3" /> {m.admin_worker_finished_word()}
			</Badge>
		);
	} else if (isFailed) {
		statusBadge = (
			<Badge variant="destructive" className="h-5 gap-1 px-2 text-[10px]">
				<AlertCircle className="size-3" /> {m.common_error()}
			</Badge>
		);
	} else {
		statusBadge = (
			<Badge variant="secondary" className="h-5 px-2 text-[10px]">
				{labels[operation.status]}
			</Badge>
		);
	}

	return (
		<article
			className={cn("group relative rounded-xl border p-4 transition-[border-color,background-color,color,box-shadow] duration-200", {
				"border-primary/40 bg-primary/3 shadow-xs ring-1 ring-primary/20": isRunning,
				"border-border/50 bg-card/40 hover:border-border/80 hover:bg-card/70": !isRunning,
			})}
		>
			<div className="flex flex-col gap-3.5 sm:flex-row sm:items-start sm:justify-between">
				{/* Left Info */}
				<div className="flex min-w-0 flex-1 items-start gap-3.5">
					<div
						className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl border shadow-xs transition-colors", {
							"animate-pulse border-primary/40 bg-primary/10 text-primary": isRunning,
							"border-success/30 bg-success/10 text-success": isCompleted,
							"border-destructive/30 bg-destructive/10 text-destructive": isFailed,
							"border-border/60 bg-muted/40 text-muted-foreground group-hover:text-foreground": !(isRunning || isCompleted || isFailed),
						})}
					>
						<OperationIcon type={operation.type} className="size-5" />
					</div>

					<div className="flex min-w-0 flex-1 flex-col gap-1.5">
						<div className="flex flex-wrap items-center gap-2">
							<h4 className="font-semibold text-foreground text-sm tracking-tight">{meta.title}</h4>
							<span className="rounded border border-border/40 bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
								{operation.type}
							</span>
							<Badge variant="outline" className="h-5 gap-1 font-mono text-[10px] text-muted-foreground">
								<span>{m.common_truncated_id({ id: operation.id.slice(0, 8) })}</span>
								<button
									type="button"
									onClick={() => detach(() => copy(operation.id, "ID operacji"))}
									className="text-muted-foreground hover:text-foreground"
									title={m.admin_worker_copy_operation_id()}
								>
									{hasCopied ? <Check className="size-2.5 text-primary" /> : <Copy className="size-2.5" />}
								</button>
							</Badge>

							{statusBadge}

							{operation.cancelRequested && (
								<Badge variant="outline" className="h-5 border-warning/30 text-[10px] text-warning">
									{m.admin_worker_cancel_requested()}
								</Badge>
							)}
						</div>

						{/* Progress Bar when Active */}
						{isActive && (
							<div className="flex flex-col gap-1.5 pt-1">
								<div className="flex items-center justify-between font-mono text-[11px]">
									<span className="flex items-center gap-1.5 font-medium text-primary">
										<span className="size-1.5 animate-ping rounded-full bg-primary" />
										{m.admin_worker_progress_line({ completed: operation.completedItems, total: operation.totalItems })}
									</span>
									<span className="font-semibold text-foreground">{m.common_percent_value({ value: Math.round(progress) })}</span>
								</div>
								<Progress value={Math.min(100, Math.max(0, progress))} className="h-1.5 w-full bg-muted/60" />
							</div>
						)}

						{/* Meta details bar */}
						<div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5 font-mono text-[11px] text-muted-foreground">
							<span>{m.admin_worker_total_jobs({ totalItems: operation.totalItems })}</span>
							<span>{m.admin_worker_completed_count({ completedItems: operation.completedItems })}</span>
							{operation.pendingItems > 0 && <span>{m.admin_worker_pending_count({ count: operation.pendingItems })}</span>}
							{operation.runningItems > 0 && <span>{m.admin_worker_running_count({ count: operation.runningItems })}</span>}
							{operation.cancelledItems > 0 && <span>{m.admin_worker_cancelled_count({ count: operation.cancelledItems })}</span>}
							{operation.failedItems > 0 && (
								<span className="font-semibold text-destructive">
									{m.admin_worker_errors_count({ failedItems: operation.failedItems })}
								</span>
							)}
							{operation.etaMs !== null && operation.etaMs > 0 && (
								<span className="font-medium text-primary">{m.admin_worker_eta_value({ eta: formatMsDuration(operation.etaMs) })}</span>
							)}
							<span>{m.admin_worker_created_at({ date: formatDate(operation.createdAt) })}</span>
							{operation.startedAt && <span>{m.admin_worker_started_at({ date: formatDate(operation.startedAt) })}</span>}
							{operation.completedAt && <span>{m.admin_worker_finished_at({ completedAt: formatDate(operation.completedAt) })}</span>}
						</div>

						{operation.error && (
							<div className="mt-2 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-destructive text-xs">
								<AlertCircle className="mt-0.5 size-4 shrink-0" />
								<p className="break-all font-mono leading-relaxed">{operation.error}</p>
							</div>
						)}
					</div>
				</div>

				{/* Right Actions */}
				<div className="flex shrink-0 items-center justify-end gap-2 pt-2 sm:pt-0">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => onInspect(operation)}
						className="h-8.5 gap-1.5 border-border/60 text-muted-foreground text-xs hover:bg-secondary hover:text-foreground"
					>
						<ListTree className="size-3.5" />
						<span>{m.admin_worker_show_items()}</span>
					</Button>

					{isResumable && (
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={resuming}
							className="h-8.5 gap-1.5 border-primary/40 font-medium text-primary text-xs hover:bg-primary/10"
							onClick={() => {
								if (resumeOperation) detach(() => resumeOperation(operation.id));
							}}
						>
							<Play className="size-3.5 fill-current" />
							<span>{resuming ? m.admin_workers_resuming_ellipsis() : m.admin_workers_resume_word()}</span>
						</Button>
					)}

					{isActive && (
						<ConfirmAction
							trigger={
								<Button type="button" variant="destructive" size="sm" disabled={cancelling} className="h-8.5 gap-1.5 font-medium text-xs">
									<Square className="size-3.5 fill-current" />
									<span>{cancelling ? m.admin_workers_cancelling_ellipsis() : m.admin_workers_stop_word()}</span>
								</Button>
							}
							title={m.admin_worker_stop_confirm()}
							description={m.admin_worker_abort_all_notice()}
							confirmLabel={m.admin_worker_stop_operation()}
							onConfirm={() => onCancel(operation.id)}
						/>
					)}
				</div>
			</div>
		</article>
	);
}
