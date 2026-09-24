import { Braces, Play, Settings2, Square } from "lucide-react";
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
			<Button
				type="button"
				variant="outline"
				size="sm"
				onClick={() => onConfigureTriggers(taskId)}
				className="h-8.5 gap-1.5 border-border/60 text-muted-foreground text-xs hover:bg-secondary hover:text-foreground"
				title={m.admin_workers_edit_trigger_schedule()}
			>
				<Settings2 className="size-3.5" />
				<span>{m.admin_workers_schedule_word()}</span>
			</Button>

			{isRunning || isQueued ? (
				<Button
					type="button"
					variant="destructive"
					size="sm"
					disabled={isBusy}
					onClick={() => onCancelTask(taskId)}
					className="h-8.5 gap-1.5 font-medium text-xs"
				>
					<Square className="size-3.5 fill-current" />
					<span>{m.admin_workers_stop_word()}</span>
				</Button>
			) : (
				<>
					<Button
						type="button"
						variant="outline"
						size="icon-sm"
						disabled={isBusy}
						onClick={() => setIsPayloadOpen(true)}
						className="h-8.5 w-8.5 text-muted-foreground hover:text-foreground"
						title={m.admin_workers_run_with_payload()}
						aria-label={m.admin_workers_run_with_payload()}
					>
						<Braces className="size-3.5" />
					</Button>
					<Button
						type="button"
						variant="default"
						size="sm"
						disabled={isBusy}
						onClick={() => onRunTask(taskId)}
						className="h-8.5 gap-1.5 font-medium text-xs shadow-xs"
					>
						<Play className="size-3.5 fill-current" />
						<span>{m.admin_workers_run_word()}</span>
					</Button>
				</>
			)}

			<Dialog open={isPayloadOpen} onOpenChange={setIsPayloadOpen}>
				<DialogContent className="gap-5 sm:max-w-lg">
					<DialogHeader className="gap-1.5">
						<DialogTitle className="font-semibold text-lg tracking-tight">
							{m.admin_workers_run_payload_title({ task: taskName })}
						</DialogTitle>
						<DialogDescription className="text-muted-foreground text-sm">{m.admin_workers_run_payload_description()}</DialogDescription>
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
							className="min-h-28 font-mono text-xs"
						/>
						{isPayloadInvalid && (
							<p role="alert" className="text-destructive text-xs">
								{m.admin_workers_run_payload_invalid()}
							</p>
						)}
					</div>
					<DialogFooter className="gap-3 border-border/60 border-t pt-4">
						<Button type="button" variant="outline" onClick={() => setIsPayloadOpen(false)}>
							{m.common_cancel()}
						</Button>
						<Button type="button" onClick={runWithPayload} className="gap-1.5">
							<Play className="size-3.5 fill-current" />
							{m.admin_workers_run_word()}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
