import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { m } from "@/paraglide/messages";

interface BanUserDialogProps {
	/** Name of the user being blocked; `null` closes the dialog. */
	userName: string | null;
	isPending: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (reason: string | null) => void;
}

/**
 * Optional-reason input for blocking an account. The server stores the reason
 * verbatim and shows it to the user, so an empty value is sent as `null`.
 */
export function BanUserDialog({ userName, isPending, onOpenChange, onConfirm }: BanUserDialogProps) {
	const [reason, setReason] = useState("");
	const isOpen = userName !== null;

	const handleOpenChange = (open: boolean) => {
		if (!open) setReason("");

		onOpenChange(open);
	};

	const handleConfirm = () => {
		const trimmed = reason.trim();
		onConfirm(trimmed.length > 0 ? trimmed : null);
		setReason("");
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{m.admin_users_ban_dialog_title()}</DialogTitle>
					<DialogDescription>{m.admin_users_ban_dialog_description({ name: userName ?? "" })}</DialogDescription>
				</DialogHeader>
				<Input value={reason} onChange={(event) => setReason(event.target.value)} placeholder={m.admin_users_ban_reason_placeholder()} />
				<DialogFooter className="gap-2 sm:justify-end">
					<Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
						{m.common_cancel()}
					</Button>
					<Button type="button" variant="destructive" onClick={handleConfirm} disabled={isPending}>
						{m.admin_users_block_action()}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
