import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { m } from "@/paraglide/messages";

interface StreamBlockDialogProps {
	isOpen: boolean;
	title: string;
	description: string;
	confirmLabel: string;
	isPending: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

/**
 * Warns that the action restarts the server, which ends the streams now playing, and asks the admin to confirm.
 * Nothing is refused here: confirming runs the action anyway.
 */
export function StreamBlockDialog({ isOpen, title, description, confirmLabel, isPending, onConfirm, onCancel }: StreamBlockDialogProps) {
	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) onCancel();
			}}
		>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<div className="text-destructive flex items-center gap-2">
						<AlertTriangle className="size-5" />
						<DialogTitle>{title}</DialogTitle>
					</div>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>

				<DialogFooter className="gap-2 sm:gap-0">
					<Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isPending}>
						{m.common_cancel()}
					</Button>
					<Button type="button" variant="destructive" size="sm" onClick={onConfirm} disabled={isPending}>
						{confirmLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
