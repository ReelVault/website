import { useState } from "react";
import { getSdkErrorMessage } from "@/client/client";
import { useTwoFactor } from "@/client/hooks/use-two-factor";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { toastError } from "@/utils/toast-utils";
import { TwoFactorBackupStep } from "./two-factor-backup-step";
import { TwoFactorPasswordStep } from "./two-factor-password-step";

interface TwoFactorBackupCodesDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

/** Replaces the account's backup codes. The previous set stops working as soon as the new one is issued. */
export function TwoFactorBackupCodesDialog({ open, onOpenChange }: TwoFactorBackupCodesDialogProps) {
	const { generateBackupCodesMutation } = useTwoFactor();
	const [backupCodes, setBackupCodes] = useState<string[] | null>(null);

	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) setBackupCodes(null);

		onOpenChange(nextOpen);
	};

	const handleGenerate = async (password: string) => {
		try {
			const result = await generateBackupCodesMutation.mutateAsync({ password });
			setBackupCodes(result.backupCodes);
		} catch (error) {
			console.error(getSdkErrorMessage(error));
			toastError(m.user_incorrect_password(), error);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{m.user_regenerate_backup_codes()}</DialogTitle>
					<DialogDescription>{m.user_regenerate_backup_codes_warning()}</DialogDescription>
				</DialogHeader>
				{backupCodes ? (
					<TwoFactorBackupStep backupCodes={backupCodes} onFinish={() => handleOpenChange(false)} />
				) : (
					<TwoFactorPasswordStep
						isPending={generateBackupCodesMutation.isPending}
						onSubmit={(password) => detach(handleGenerate(password))}
						onCancel={() => handleOpenChange(false)}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
}
