import type { WorkerJob } from "@reelvault/sdk";
import { AlertCircle, ChevronDown, ChevronRight, Code2, RotateCw } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { m } from "@/paraglide/messages";
import { formatCountdown } from "@/utils/format-utils";
import { formatDate, formatMsDuration, getWorkerMeta, labels, useCurrentTime } from "../worker-utils";

/** Empty strings count as "no value" for presence checks. */
const hasValue = (value: unknown): boolean => typeof value === "string" && value.length > 0;

function useItemTiming(item: WorkerJob, timeoutMs?: number) {
	// Only pending/running rows need the 1 Hz clock — finished rows never re-render.
	const now = useCurrentTime(item.status === "pending" || item.status === "running");
	let stage: string;
	if (item.status === "running") {
		stage = m.admin_workers_attempt_of({ attempts: item.attempts, maxAttempts: item.maxAttempts });
	} else if (item.status === "pending") {
		stage = m.admin_worker_scheduled_at({ date: formatDate(item.runAt) });
	} else if (item.status === "cancelled") {
		stage = m.admin_workers_cancelled_at({ date: formatDate(item.completedAt) });
	} else {
		stage = m.admin_workers_finished_at_label({ date: formatDate(item.completedAt) });
	}

	let remainingMs: number | undefined;
	if (item.status === "pending") {
		remainingMs = new Date(item.runAt).getTime() - now;
	} else if (item.status === "running" && item.startedAt && timeoutMs) {
		remainingMs = new Date(item.startedAt).getTime() + timeoutMs - now;
	}

	let countdownLabel: string | undefined;
	if (remainingMs !== undefined) {
		if (item.status === "pending") {
			countdownLabel = m.admin_worker_start_in({ countdown: formatCountdown(remainingMs) });
		} else if (remainingMs > 0) {
			countdownLabel = m.admin_workers_remaining_label({ remaining: formatCountdown(remainingMs) });
		} else {
			countdownLabel = m.admin_workers_timeout_exceeded();
		}
	}

	const duration =
		item.startedAt && item.completedAt ? new Date(item.completedAt).getTime() - new Date(item.startedAt).getTime() : undefined;

	return { stage, remainingMs, countdownLabel, duration };
}

interface OperationItemRowProps {
	item: WorkerJob;
	timeoutMs?: number;
	isExpanded: boolean;
	onToggleExpand: () => void;
	onRetry?: (jobId: string) => void;
	isRetrying?: boolean;
}

export function OperationItemRow({ item, timeoutMs, isExpanded, onToggleExpand, onRetry, isRetrying }: OperationItemRowProps) {
	const { stage, countdownLabel, duration } = useItemTiming(item, timeoutMs);
	const meta = getWorkerMeta(item.workerId);
	const hasDetails = [item.error, item.result, item.referenceType, item.referenceId, item.dedupeKey].some((value) => hasValue(value));

	return (
		<>
			<TableRow data-state={isExpanded ? "selected" : undefined}>
				<TableCell className="w-8 text-center">
					{hasDetails ? (
						<Button
							tone="muted"
							type="button"
							variant="ghost"
							size="icon-xs"
							aria-label={isExpanded ? m.admin_worker_collapse_details() : m.admin_worker_expand_details()}
							onClick={onToggleExpand}
						>
							{isExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
						</Button>
					) : (
						<span className="inline-block size-6" />
					)}
				</TableCell>

				<TableCell size="sm">
					<div>
						<span className="text-foreground font-semibold">{meta.title}</span>
						<span className="text-muted-foreground block font-mono text-xs">{item.workerId}</span>
					</div>
				</TableCell>

				<TableCell>
					<StatusBadge status={item.status === "failed" ? "error" : item.status} label={labels[item.status]} />
				</TableCell>

				<TableCell size="sm">
					<span className="text-muted-foreground">{stage}</span>
					{countdownLabel && <span className="text-primary block font-mono text-xs">{countdownLabel}</span>}
				</TableCell>

				<TableCell tone="mono" size="sm">
					{duration === undefined ? m.common_no_value() : formatMsDuration(duration)}
				</TableCell>

				<TableCell className="text-right">
					{item.status === "failed" && onRetry && (
						<Button type="button" variant="primary-ghost" size="sm" disabled={isRetrying} onClick={() => onRetry(item.id)}>
							<RotateCw className="size-3" />
							<span>{m.admin_workers_retry_word()}</span>
						</Button>
					)}
					{hasDetails && (
						<Button tone="muted" type="button" variant="ghost" size="sm" onClick={onToggleExpand}>
							<Code2 className="size-3" />
							<span>{isExpanded ? m.admin_worker_hide_details() : m.admin_worker_show_details()}</span>
						</Button>
					)}
				</TableCell>
			</TableRow>

			{isExpanded && hasDetails && (
				<TableRow className="border-b">
					<TableCell colSpan={6} className="pl-10">
						<div className="flex flex-col gap-2">
							{item.error && (
								<div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border p-2.5 text-xs">
									<p className="mb-1 flex items-center gap-1.5 font-semibold">
										<AlertCircle className="size-3.5" />
										{m.admin_workers_error_exec()}
									</p>
									<pre className="font-mono text-xs leading-relaxed break-all whitespace-pre-wrap">{item.error}</pre>
								</div>
							)}

							{(hasValue(item.referenceType) || hasValue(item.referenceId) || hasValue(item.dedupeKey)) && (
								<div className="border-border/60 bg-card/60 rounded-lg border p-2.5 text-xs">
									<span className="text-muted-foreground mb-1 block text-xs font-semibold">{m.admin_workers_job_refs()}</span>
									<div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs">
										{item.referenceType && (
											<span>
												{m.admin_workers_ref_type()} <strong className="text-foreground">{item.referenceType}</strong>
											</span>
										)}
										{item.referenceId && (
											<span>
												{m.admin_workers_ref_id()} <strong className="text-foreground">{item.referenceId}</strong>
											</span>
										)}
										{item.dedupeKey && (
											<span>
												{m.admin_workers_dedupe_key()} <strong className="text-foreground">{item.dedupeKey}</strong>
											</span>
										)}
									</div>
								</div>
							)}

							<div className="border-border/60 bg-card/60 rounded-lg border p-2.5 text-xs">
								<span className="text-muted-foreground mb-1 block text-xs font-semibold">{m.admin_workers_job_meta()}</span>
								<div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs">
									<span>
										{m.admin_workers_job_priority_label()}
										<strong className="text-foreground">{item.priority}</strong>
									</span>
									{item.runnerId && (
										<span>
											{m.admin_workers_job_runner_label()}
											<strong className="text-foreground">{item.runnerId}</strong>
										</span>
									)}
									{item.progressPercent != null && (
										<span>
											{m.admin_workers_job_progress_label()}
											<strong className="text-foreground">{m.common_percent_value({ value: Math.round(item.progressPercent) })}</strong>
										</span>
									)}
									{item.dependsOnTaskIds.length > 0 && (
										<span>
											{m.admin_workers_job_depends_on_label()}
											<strong className="text-foreground">{item.dependsOnTaskIds.join(", ")}</strong>
										</span>
									)}
									<span>
										{m.admin_workers_job_created_label()}
										<strong className="text-foreground">{formatDate(item.createdAt)}</strong>
									</span>
									<span>
										{m.admin_workers_job_updated_label()}
										<strong className="text-foreground">{formatDate(item.updatedAt)}</strong>
									</span>
								</div>
							</div>

							{item.result !== undefined && item.result !== null && (
								<div className="border-success/20 bg-success/3 rounded-lg border p-2.5">
									<span className="text-success mb-1 block text-xs font-semibold">{m.admin_workers_result_out()}</span>
									<pre className="text-foreground max-h-48 overflow-auto font-mono text-xs leading-relaxed">
										{typeof item.result === "string" ? item.result : JSON.stringify(item.result, null, 2)}
									</pre>
								</div>
							)}
						</div>
					</TableCell>
				</TableRow>
			)}
		</>
	);
}
