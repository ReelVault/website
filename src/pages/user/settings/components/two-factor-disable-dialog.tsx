import type React from "react";
import { useState } from "react";
import { getSdkErrorMessage } from "@/client/client";
import { useTwoFactor } from "@/client/hooks/use-two-factor";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "@/utils/toast-utils";

interface TwoFactorDisableDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function TwoFactorDisableDialog({ open, onOpenChange }: TwoFactorDisableDialogProps) {
	const { disableMutation } = useTwoFactor();
	const [password, setPassword] = useState("");

	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			setPassword("");
		}

		onOpenChange(nextOpen);
	};

	const disableTwoFactor = async (passwordValue: string) => {
		try {
			await disableMutation.mutateAsync({ password: passwordValue });
			toast.success(m.user_2fa_turned_off());
			handleOpenChange(false);
		} catch (error) {
			console.error(getSdkErrorMessage(error));
			toastError(m.user_failed_to_disable_2fa(), error);
		}
	};

	const handleDisable = (e: React.SubmitEvent) => {
		e.preventDefault();
		if (!password || disableMutation.isPending) return;

		detach(disableTwoFactor(password));
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{m.user_disable_2fa()}</DialogTitle>
					<DialogDescription>{m.user_enter_password_disable_2fa()}</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleDisable} className="flex flex-col gap-4 py-2">
					<div className="flex flex-col gap-2">
						<label htmlFor="2fa-disable-password" className="font-semibold text-muted-foreground text-xs uppercase">
							{m.user_account_password()}
						</label>
						<Input
							id="2fa-disable-password"
							type="password"
							required
							placeholder={m.user_your_password()}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="h-10"
						/>
					</div>
					<DialogFooter className="mt-4">
						<Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
							{m.common_cancel()}
						</Button>
						<Button type="submit" variant="destructive" disabled={disableMutation.isPending || !password}>
							{disableMutation.isPending ? m.user_disabling() : m.user_confirm_disable_2fa()}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
