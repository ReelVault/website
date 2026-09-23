import { AlertTriangle, RefreshCw, Trash2 } from "lucide-react";
import type { PurgeWorkerHistoryOptions } from "@reelvault/sdk";
import { usePurgeWorkerHistory } from "@/client/hooks/use-admin-jobs";
import { useDialogForm } from "@/client/hooks/use-dialog-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";

function renderStrong(chunks: string) {
	return <strong>{chunks}</strong>;
}

interface PurgeHistoryDialogProps {
	isOpen: boolean;
	onClose: () => void;
}

export function PurgeHistoryDialog({ isOpen, onClose }: PurgeHistoryDialogProps) {
	const { formState, setFormState, handleOpenChange } = useDialogForm<{
		status: PurgeWorkerHistoryOptions["status"];
		olderThanDays: string;
	}>({
		status: "all_terminal",
		olderThanDays: "0",
	});
	const purgeMutation = usePurgeWorkerHistory();

	const handlePurge = () => {
		const options: PurgeWorkerHistoryOptions = {
			status: formState.status,
			olderThanDays: Number.parseInt(formState.olderThanDays, 10),
		};

		detach(async () => {
			try {
				await purgeMutation.mutateAsync(options);
				handleOpenChange(false, onClose);
			} catch {
				// Toast handled by mutation
			}
		});
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => handleOpenChange(open, onClose)}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<div className="flex items-center gap-2 text-destructive">
						<Trash2 className="size-5" />
						<DialogTitle>{m.admin_worker_history_cleanup()}</DialogTitle>
					</div>
					<DialogDescription>{m.admin_worker_purge_history_dialog_desc()}</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-4 py-2">
					{/* Status Selection */}
					<div className="flex flex-col gap-2">
						<Label className="font-semibold text-foreground text-xs">{m.admin_worker_record_type()}</Label>
						<Select
							value={formState.status}
							onValueChange={(val) => {
								if (val) setFormState((prev) => ({ ...prev, status: val }));
							}}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder={m.common_select_status()} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all_terminal">{m.admin_worker_filter_all_finished()}</SelectItem>
								<SelectItem value="failed">{m.admin_worker_only_failed()}</SelectItem>
								<SelectItem value="completed">{m.admin_worker_only_completed()}</SelectItem>
								<SelectItem value="cancelled">{m.admin_workers_only_cancelled()}</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Age / Retention Selection */}
					<div className="flex flex-col gap-2">
						<Label className="font-semibold text-foreground text-xs">{m.admin_worker_record_age()}</Label>
						<Select
							value={formState.olderThanDays}
							onValueChange={(val) => {
								if (val !== null) setFormState((prev) => ({ ...prev, olderThanDays: val }));
							}}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder={m.common_select_age()} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="0">{m.admin_worker_delete_all_immediate()}</SelectItem>
								<SelectItem value="3">{m.admin_worker_older_than_3d()}</SelectItem>
								<SelectItem value="7">{m.admin_worker_older_than_7d()}</SelectItem>
								<SelectItem value="14">{m.admin_worker_older_than_14d()}</SelectItem>
								<SelectItem value="30">{m.admin_worker_older_than_30d()}</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Warning Note */}
					<div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-muted-foreground text-xs">
						<AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
						<p>
							{m.admin_worker_purge_irreversible_warning({
								strong: renderStrong,
							})}
						</p>
					</div>
				</div>

				<DialogFooter className="gap-2 sm:gap-0">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => handleOpenChange(false, onClose)}
						disabled={purgeMutation.isPending}
					>
						{m.common_cancel()}
					</Button>
					<Button
						type="button"
						variant="destructive"
						size="sm"
						onClick={handlePurge}
						disabled={purgeMutation.isPending}
						className="gap-1.5"
					>
						{purgeMutation.isPending ? (
							<>
								<RefreshCw className="size-3.5 animate-spin" />
								<span>{m.common_cancelling()}</span>
							</>
						) : (
							<>
								<Trash2 className="size-3.5" />
								<span>{m.admin_worker_clear_records()}</span>
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
