import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { m } from "@/paraglide/messages";

/** Asks whether to leave a page with unsaved edits. `onAnswer(true)` leaves, `false` stays. */
export function UnsavedChangesDialog({ open, onAnswer }: { open: boolean; onAnswer: (leave: boolean) => void }) {
	return (
		<AlertDialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (!nextOpen) onAnswer(false);
			}}
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{m.admin_settings_unsaved_changes()}</AlertDialogTitle>
					<AlertDialogDescription>{m.admin_settings_leave_unsaved_description()}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={() => onAnswer(false)}>{m.admin_settings_stay_here()}</AlertDialogCancel>
					<AlertDialogAction onClick={() => onAnswer(true)}>{m.admin_settings_leave_page()}</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
