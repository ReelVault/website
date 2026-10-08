import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { m } from "@/paraglide/messages";

interface DeleteUserDialogProps {
	/** Name of the user being deleted; `null` closes the dialog. */
	userName: string | null;
	isPending: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
}

/** Confirmation for the irreversible account deletion triggered from the user list. */
export function DeleteUserDialog({ userName, isPending, onOpenChange, onConfirm }: DeleteUserDialogProps) {
	return (
		<Dialog open={userName !== null} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{m.admin_users_delete_account_confirm({ name: userName ?? "" })}</DialogTitle>
					<DialogDescription>{m.admin_users_delete_account_warning()}</DialogDescription>
				</DialogHeader>
				<DialogFooter className="gap-2 sm:justify-end">
					<Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
						{m.common_cancel()}
					</Button>
					<Button type="button" variant="destructive" onClick={onConfirm} disabled={isPending}>
						{m.admin_users_delete_account()}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
