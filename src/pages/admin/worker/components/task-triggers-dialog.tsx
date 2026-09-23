import type { TaskTrigger, WorkerSummary } from "@reelvault/sdk";
import { Clock, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { TaskTriggerForm } from "./triggers/task-trigger-form";
import { TaskTriggerItem } from "./triggers/task-trigger-item";
import { getScheduledTaskMeta } from "./worker-utils";

interface TaskTriggersDialogProps {
	task: WorkerSummary | null;
	isOpen: boolean;
	onClose: () => void;
	onSave: (taskId: string, triggers: TaskTrigger[]) => Promise<void>;
	isSaving?: boolean;
}

export function TaskTriggersDialog({ task, isOpen, onClose, onSave, isSaving }: TaskTriggersDialogProps) {
	const [triggers, setTriggers] = useState<TaskTrigger[]>([]);
	const [isAdding, setIsAdding] = useState(false);

	useEffect(() => {
		if (task && isOpen) {
			// react-doctor-disable-next-line react-doctor/no-adjust-state-on-prop-change
			setTriggers([...task.triggers]);
			// react-doctor-disable-next-line react-doctor/no-adjust-state-on-prop-change
			setIsAdding(false);
		}
	}, [task, isOpen]);

	if (!task) return null;

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			setIsAdding(false);
			onClose();
		}
	};

	const handleDeleteTrigger = (triggerId: string) => {
		setTriggers((prev) => prev.filter((t) => t.id !== triggerId));
	};

	const handleAddTrigger = (newTrigger: TaskTrigger) => {
		setTriggers((prev) => [...prev, newTrigger]);
		setIsAdding(false);
	};

	const handleSaveAll = async () => {
		await onSave(task.id, triggers);
		onClose();
	};

	const taskMeta = getScheduledTaskMeta(task.id);
	const taskTitle = taskMeta.title !== task.id ? taskMeta.title : task.name || task.id;
	const taskDescription = taskMeta.description || task.description;

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent className="max-w-xl border-border/60 bg-card shadow-2xl">
				<DialogHeader className="flex flex-col gap-1.5 pb-1">
					<div className="flex items-center gap-2.5">
						<div className="flex size-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
							<Clock className="size-4.5" />
						</div>
						<div>
							<DialogTitle className="font-bold text-base text-foreground tracking-tight">{taskTitle}</DialogTitle>
							<DialogDescription className="line-clamp-1 text-muted-foreground text-xs">{taskDescription}</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="flex flex-col gap-4 py-2">
					<div className="flex items-center justify-between border-border/40 border-b pb-2.5">
						<div>
							<h4 className="font-semibold text-foreground text-xs uppercase tracking-tight">
								{m.admin_worker_configured_rules({ triggersCount: triggers.length })}
							</h4>
							<p className="text-[11px] text-muted-foreground">{m.admin_worker_triggers_description()}</p>
						</div>
						{!isAdding && (
							<Button
								type="button"
								size="sm"
								variant="outline"
								onClick={() => setIsAdding(true)}
								className="h-7.5 gap-1.5 border-border/70 text-xs hover:bg-accent"
							>
								<Plus className="size-3.5" />
								{m.admin_workers_add_trigger()}
							</Button>
						)}
					</div>

					{/* Form: Add Trigger */}
					{isAdding && <TaskTriggerForm onAdd={handleAddTrigger} onCancel={() => setIsAdding(false)} />}

					{/* Triggers list */}
					<div className="flex max-h-75 flex-col gap-2 overflow-y-auto pr-1">
						{triggers.length === 0 ? (
							<div className="flex flex-col items-center justify-center rounded-xl border border-border/70 border-dashed bg-card/30 p-6 text-center">
								<div className="mb-2 flex size-9 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
									<Clock className="size-4.5" />
								</div>
								<p className="font-medium text-foreground text-xs">{m.admin_workers_no_triggers()}</p>
								<p className="mt-0.5 max-w-xs text-[11px] text-muted-foreground">{m.admin_workers_no_triggers_desc()}</p>
								{!isAdding && (
									<Button type="button" size="sm" variant="outline" onClick={() => setIsAdding(true)} className="mt-3 h-7 gap-1.5 text-xs">
										<Plus className="size-3" />
										{m.admin_workers_add_first_trigger()}
									</Button>
								)}
							</div>
						) : (
							triggers.map((trigger) => <TaskTriggerItem key={trigger.id} trigger={trigger} onDelete={handleDeleteTrigger} />)
						)}
					</div>
				</div>

				<DialogFooter className="gap-2 border-border/40 border-t pt-3 sm:gap-0">
					<Button type="button" variant="ghost" onClick={onClose} disabled={isSaving} className="h-8.5 text-xs">
						{m.common_close()}
					</Button>
					<Button type="button" onClick={() => detach(handleSaveAll())} disabled={isSaving} className="h-8.5 gap-1.5 font-medium text-xs">
						{isSaving ? m.common_saving_dots() : m.admin_workers_save_schedule()}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
