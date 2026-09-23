import { useState } from "react";
import { getSdkErrorMessage } from "@/client/client";
import { useTwoFactor } from "@/client/hooks/use-two-factor";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "@/utils/toast-utils";
import { TwoFactorBackupStep } from "./two-factor-backup-step";
import { TwoFactorPasswordStep } from "./two-factor-password-step";
import { TwoFactorVerifyStep } from "./two-factor-verify-step";

interface TwoFactorSetupDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function TwoFactorSetupDialog({ open, onOpenChange }: TwoFactorSetupDialogProps) {
	const { enableMutation, verifyMutation } = useTwoFactor();

	const [totpUri, setTotpUri] = useState<string | null>(null);
	const [backupCodes, setBackupCodes] = useState<string[]>([]);
	const [setupStep, setSetupStep] = useState<"password" | "verify" | "backup">("password");

	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			setTotpUri(null);
			setBackupCodes([]);
			setSetupStep("password");
		}

		onOpenChange(nextOpen);
	};

	const handleInitEnable = async (password: string) => {
		try {
			const res = await enableMutation.mutateAsync({ password });
			setTotpUri(res.totpURI);
			setBackupCodes(res.backupCodes);
			setSetupStep("verify");
		} catch (error) {
			console.error(getSdkErrorMessage(error));
			toastError(m.user_incorrect_password(), error);
		}
	};

	const handleVerifyTotp = async (code: string) => {
		try {
			await verifyMutation.mutateAsync({ code });
			toast.success(m.user_2fa_enabled_success());
			setSetupStep("backup");
		} catch (error) {
			console.error(getSdkErrorMessage(error));
			toastError(m.user_invalid_verification_code(), error);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{m.user_2fa_setup_heading()}</DialogTitle>
					<DialogDescription>
						{setupStep === "password" && m.user_enter_current_password()}
						{setupStep === "verify" && m.user_scan_or_copy_key()}
						{setupStep === "backup" && m.user_backup_codes_note()}
					</DialogDescription>
				</DialogHeader>

				{setupStep === "password" && (
					<TwoFactorPasswordStep
						isPending={enableMutation.isPending}
						onSubmit={(password) => {
							detach(handleInitEnable(password));
						}}
						onCancel={() => handleOpenChange(false)}
					/>
				)}

				{setupStep === "verify" && totpUri && (
					<TwoFactorVerifyStep
						totpUri={totpUri}
						isPending={verifyMutation.isPending}
						onSubmit={(code) => {
							detach(handleVerifyTotp(code));
						}}
						onCancel={() => handleOpenChange(false)}
					/>
				)}

				{setupStep === "backup" && <TwoFactorBackupStep backupCodes={backupCodes} onFinish={() => handleOpenChange(false)} />}
			</DialogContent>
		</Dialog>
	);
}
