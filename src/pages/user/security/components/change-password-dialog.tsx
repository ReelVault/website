import type React from "react";
import { useState } from "react";
import { useChangePassword } from "@/client/hooks/use-change-password";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "@/utils/toast-utils";

const MIN_PASSWORD_LENGTH = 8;

interface ChangePasswordDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
	const changePassword = useChangePassword();
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
	const canSubmit = currentPassword.length > 0 && newPassword.length >= MIN_PASSWORD_LENGTH && newPassword === confirmPassword;

	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
		}

		onOpenChange(nextOpen);
	};

	const submit = async () => {
		try {
			await changePassword.mutateAsync({ currentPassword, newPassword });
			toast.success(m.user_password_changed());
			handleOpenChange(false);
		} catch (error) {
			toastError(m.user_failed_to_change_password(), error);
		}
	};

	const handleSubmit = (e: React.SubmitEvent) => {
		e.preventDefault();
		if (!canSubmit || changePassword.isPending) return;

		detach(submit());
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{m.user_change_password()}</DialogTitle>
					<DialogDescription>{m.user_change_password_description()}</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
					<div className="flex flex-col gap-2">
						<label htmlFor="change-password-current" className="text-muted-foreground text-xs font-semibold">
							{m.user_current_password()}
						</label>
						<Input
							id="change-password-current"
							type="password"
							autoComplete="current-password"
							required
							value={currentPassword}
							onChange={(e) => setCurrentPassword(e.target.value)}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<label htmlFor="change-password-new" className="text-muted-foreground text-xs font-semibold">
							{m.user_new_password()}
						</label>
						<Input
							id="change-password-new"
							type="password"
							autoComplete="new-password"
							required
							minLength={MIN_PASSWORD_LENGTH}
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
						/>
						<p className="text-muted-foreground text-xs">{m.user_password_min_length()}</p>
					</div>
					<div className="flex flex-col gap-2">
						<label htmlFor="change-password-confirm" className="text-muted-foreground text-xs font-semibold">
							{m.user_confirm_new_password()}
						</label>
						<Input
							id="change-password-confirm"
							type="password"
							autoComplete="new-password"
							required
							aria-invalid={mismatch}
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
						/>
						{mismatch && <p className="text-destructive text-xs">{m.user_passwords_do_not_match()}</p>}
					</div>
					<DialogFooter className="mt-4">
						<Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
							{m.common_cancel()}
						</Button>
						<Button type="submit" disabled={changePassword.isPending || !canSubmit}>
							{m.common_save()}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
