import { cn } from "cn";
import { AlertCircle, ChevronDown, ChevronRight, Code2 } from "lucide-react";
import type { WorkerJob } from "reelvault-sdk";
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
}

export function OperationItemRow({ item, timeoutMs, isExpanded, onToggleExpand }: OperationItemRowProps) {
	const { stage, countdownLabel, duration } = useItemTiming(item, timeoutMs);
	const meta = getWorkerMeta(item.workerId);
	const hasDetails = [item.error, item.result, item.referenceType, item.referenceId, item.dedupeKey].some((value) => hasValue(value));

	return (
		<>
			<TableRow className={cn("transition-colors hover:bg-muted/30", isExpanded && "bg-muted/20")}>
				<TableCell className="w-8 px-2 text-center">
					{hasDetails ? (
						<Button
							type="button"
							variant="ghost"
							size="icon-xs"
							aria-label={isExpanded ? m.admin_worker_collapse_details() : m.admin_worker_expand_details()}
							onClick={onToggleExpand}
							className="size-6 text-muted-foreground hover:text-foreground"
						>
							{isExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
						</Button>
					) : (
						<span className="inline-block size-6" />
					)}
				</TableCell>

				<TableCell className="font-medium text-xs">
					<div>
						<span className="font-semibold text-foreground">{meta.title}</span>
						<span className="block font-mono text-[10px] text-muted-foreground">{item.workerId}</span>
					</div>
				</TableCell>

				<TableCell>
					<StatusBadge status={item.status === "failed" ? "error" : item.status} label={labels[item.status]} />
				</TableCell>

				<TableCell className="text-xs">
					<span className="text-muted-foreground">{stage}</span>
					{countdownLabel && <span className="block font-mono text-[10px] text-primary">{countdownLabel}</span>}
				</TableCell>

				<TableCell className="font-mono text-muted-foreground text-xs tabular-nums">
					{duration === undefined ? m.common_no_value() : formatMsDuration(duration)}
				</TableCell>

				<TableCell className="text-right">
					{hasDetails && (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={onToggleExpand}
							className="h-7 gap-1 text-[11px] text-muted-foreground hover:text-foreground"
						>
							<Code2 className="size-3" />
							<span>{isExpanded ? m.admin_worker_hide_details() : m.admin_worker_show_details()}</span>
						</Button>
					)}
				</TableCell>
			</TableRow>

			{isExpanded && hasDetails && (
				<TableRow className="border-border/60 border-b bg-muted/15">
					<TableCell colSpan={6} className="p-3 pl-10">
						<div className="flex flex-col gap-2">
							{item.error && (
								<div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-destructive text-xs">
									<p className="mb-1 flex items-center gap-1.5 font-semibold">
										<AlertCircle className="size-3.5" />
										{m.admin_workers_error_exec()}
									</p>
									<pre className="whitespace-pre-wrap break-all font-mono text-[11px] leading-relaxed">{item.error}</pre>
								</div>
							)}

							{(hasValue(item.referenceType) || hasValue(item.referenceId) || hasValue(item.dedupeKey)) && (
								<div className="rounded-lg border border-border/60 bg-card/60 p-2.5 text-xs">
									<span className="mb-1 block font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
										{m.admin_workers_job_refs()}
									</span>
									<div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-muted-foreground">
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

							<div className="rounded-lg border border-border/60 bg-card/60 p-2.5 text-xs">
								<span className="mb-1 block font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
									{m.admin_workers_job_meta()}
								</span>
								<div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-muted-foreground">
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
								<div className="rounded-lg border border-success/20 bg-success/3 p-2.5">
									<span className="mb-1 block font-semibold text-[10px] text-success uppercase tracking-wider">
										{m.admin_workers_result_out()}
									</span>
									<pre className="max-h-48 overflow-auto font-mono text-[10px] text-foreground leading-relaxed">
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
