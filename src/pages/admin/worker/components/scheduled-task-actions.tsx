import { Braces, PauseCircle, Play, PlayCircle, Settings2, Square } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { m } from "@/paraglide/messages";

export type WorkerRunParams = string | { workerId: string; data?: unknown };

interface ScheduledTaskActionsProps {
	taskId: string;
	taskName: string;
	isRunning: boolean;
	isQueued: boolean;
	isBusy: boolean;
	onConfigureTriggers: (taskId: string) => void;
	onRunTask: (params: WorkerRunParams) => void;
	onCancelTask: (taskId: string) => void;
	scheduleEnabled: boolean;
	onToggleSchedule: (taskId: string, enabled: boolean) => void;
}

export function ScheduledTaskActions({
	taskId,
	taskName,
	isRunning,
	isQueued,
	isBusy,
	onConfigureTriggers,
	onRunTask,
	onCancelTask,
	scheduleEnabled,
	onToggleSchedule,
}: ScheduledTaskActionsProps) {
	const [isPayloadOpen, setIsPayloadOpen] = useState(false);
	const [payloadDraft, setPayloadDraft] = useState("");
	const [isPayloadInvalid, setIsPayloadInvalid] = useState(false);

	const runWithPayload = () => {
		const trimmed = payloadDraft.trim();
		if (trimmed === "") {
			onRunTask(taskId);
			setIsPayloadOpen(false);

			return;
		}

		try {
			const data: unknown = JSON.parse(trimmed);
			onRunTask({ workerId: taskId, data });
			setIsPayloadOpen(false);
			setPayloadDraft("");
			setIsPayloadInvalid(false);
		} catch {
			setIsPayloadInvalid(true);
		}
	};

	return (
		<div className="flex shrink-0 items-center justify-end gap-2 pt-2 sm:pt-0">
			{/* Pausing stops automatic runs only; manual runs and the queue stay available. */}
			<Button
				tone="muted"
				type="button"
				variant="outline"
				size="sm"
				disabled={isBusy}
				onClick={() => onToggleSchedule(taskId, !scheduleEnabled)}
			>
				{scheduleEnabled ? <PauseCircle className="size-3.5" /> : <PlayCircle className="size-3.5" />}
				<span>{scheduleEnabled ? m.admin_workers_pause_word() : m.admin_workers_resume_word()}</span>
			</Button>
			<Button
				tone="muted"
				type="button"
				variant="outline"
				size="sm"
				onClick={() => onConfigureTriggers(taskId)}
				title={m.admin_workers_edit_trigger_schedule()}
			>
				<Settings2 className="size-3.5" />
				<span>{m.admin_workers_schedule_word()}</span>
			</Button>

			{isRunning || isQueued ? (
				<Button type="button" variant="destructive" size="sm" disabled={isBusy} onClick={() => onCancelTask(taskId)}>
					<Square className="size-3.5 fill-current" />
					<span>{m.admin_workers_stop_word()}</span>
				</Button>
			) : (
				<>
					<Button
						tone="muted"
						type="button"
						variant="outline"
						size="icon-sm"
						disabled={isBusy}
						onClick={() => setIsPayloadOpen(true)}
						className="w-8.5"
						title={m.admin_workers_run_with_payload()}
						aria-label={m.admin_workers_run_with_payload()}
					>
						<Braces className="size-3.5" />
					</Button>
					<Button type="button" variant="default" size="sm" disabled={isBusy} onClick={() => onRunTask(taskId)}>
						<Play className="size-3.5 fill-current" />
						<span>{m.admin_workers_run_word()}</span>
					</Button>
				</>
			)}

			<Dialog open={isPayloadOpen} onOpenChange={setIsPayloadOpen}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader className="gap-1.5">
						<DialogTitle>{m.admin_workers_run_payload_title({ task: taskName })}</DialogTitle>
						<DialogDescription>{m.admin_workers_run_payload_description()}</DialogDescription>
					</DialogHeader>
					<div className="flex flex-col gap-2">
						<Textarea
							value={payloadDraft}
							onChange={(event) => {
								setPayloadDraft(event.target.value);
								setIsPayloadInvalid(false);
							}}
							placeholder={m.admin_workers_run_payload_placeholder()}
							aria-invalid={isPayloadInvalid}
							className="min-h-28"
						/>
						{isPayloadInvalid && (
							<p role="alert" className="text-destructive text-xs">
								{m.admin_workers_run_payload_invalid()}
							</p>
						)}
					</div>
					<DialogFooter className="gap-3 border-t">
						<Button type="button" variant="outline" onClick={() => setIsPayloadOpen(false)}>
							{m.common_cancel()}
						</Button>
						<Button type="button" onClick={runWithPayload}>
							<Play className="size-3.5 fill-current" />
							{m.admin_workers_run_word()}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
