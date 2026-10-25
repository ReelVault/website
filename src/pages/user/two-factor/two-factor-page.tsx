import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { cn } from "cn";
import { ArrowLeft, Check } from "lucide-react";
import { useState } from "react";
import { useTwoFactor } from "@/client/hooks/use-two-factor";
import { getSdkErrorMessage } from "@/client/sdk-error-message";
import { usePageTitle } from "@/hooks/use-page-title";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "@/utils/toast-utils";
import { UserPageHeader, UserSurface } from "../components/user-ui";
import { TwoFactorBackupStep } from "../settings/components/two-factor-backup-step";
import { TwoFactorPasswordStep } from "../settings/components/two-factor-password-step";
import { TwoFactorVerifyStep } from "../settings/components/two-factor-verify-step";

type SetupStep = "password" | "verify" | "backup";

const ENABLE_STEPS: SetupStep[] = ["password", "verify", "backup"];
const REGENERATE_STEPS: SetupStep[] = ["password", "backup"];

function stepLabel(step: SetupStep) {
	if (step === "password") return m.user_2fa_step_password();
	if (step === "verify") return m.user_2fa_step_scan();

	return m.user_2fa_step_backup();
}

function stepDescription(step: SetupStep, isEnable: boolean) {
	if (step === "password") return isEnable ? m.user_enter_current_password() : m.user_regenerate_backup_codes_warning();
	if (step === "verify") return m.user_scan_or_copy_key();

	return m.user_backup_codes_note();
}

function StepIndicator({ steps, current }: { steps: SetupStep[]; current: SetupStep }) {
	const currentIndex = steps.indexOf(current);

	return (
		<ol className="flex flex-col gap-2 sm:flex-row sm:gap-3">
			{steps.map((step, index) => {
				const isDone = index < currentIndex;
				const isCurrent = index === currentIndex;

				return (
					<li
						key={step}
						aria-current={isCurrent ? "step" : undefined}
						className={cn("flex flex-1 items-center gap-3 rounded-xl border px-4 py-3 text-sm", {
							"border-primary bg-primary/10 font-semibold text-foreground": isCurrent,
							"border-success/40 text-muted-foreground": isDone,
							"border-border text-muted-foreground": !(isCurrent || isDone),
						})}
					>
						<span
							className={cn("flex size-6 shrink-0 items-center justify-center rounded-full font-semibold text-xs", {
								"bg-primary text-primary-foreground": isCurrent,
								"bg-success/15 text-success": isDone,
								"bg-muted": !(isCurrent || isDone),
							})}
						>
							{isDone ? <Check className="size-3.5" aria-hidden="true" /> : index + 1}
						</span>
						{stepLabel(step)}
					</li>
				);
			})}
		</ol>
	);
}

export default function TwoFactorPage() {
	const { mode } = useSearch({ from: "/_user/two-factor" });
	const navigate = useNavigate();
	const { enableMutation, verifyMutation, generateBackupCodesMutation } = useTwoFactor();

	const isEnable = mode === "enable";
	const steps = isEnable ? ENABLE_STEPS : REGENERATE_STEPS;
	const title = isEnable ? m.user_2fa_setup_heading() : m.user_regenerate_backup_codes();
	usePageTitle(title);

	const [step, setStep] = useState<SetupStep>("password");
	const [totpUri, setTotpUri] = useState<string | null>(null);
	const [backupCodes, setBackupCodes] = useState<string[]>([]);

	// The codes are only held in this page's state. Leaving the page discards them, so the page keeps them on screen until "Finish".
	const goToSettings = () => detach(navigate({ to: "/settings" }));

	const handlePassword = async (password: string) => {
		try {
			if (isEnable) {
				const res = await enableMutation.mutateAsync({ password });
				setTotpUri(res.totpURI);
				setBackupCodes(res.backupCodes);
				setStep("verify");

				return;
			}

			const res = await generateBackupCodesMutation.mutateAsync({ password });
			setBackupCodes(res.backupCodes);
			setStep("backup");
		} catch (error) {
			console.error(getSdkErrorMessage(error));
			toastError(m.user_incorrect_password(), error);
		}
	};

	const handleVerify = async (code: string) => {
		try {
			await verifyMutation.mutateAsync({ code });
			toast.success(m.user_2fa_enabled_success());
			setStep("backup");
		} catch (error) {
			console.error(getSdkErrorMessage(error));
			toastError(m.user_invalid_verification_code(), error);
		}
	};

	return (
		<main className="mx-auto flex w-full max-w-2xl flex-col gap-8 pb-10">
			<Link
				to="/settings"
				className="inline-flex min-h-11 w-fit items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
			>
				<ArrowLeft className="size-4" aria-hidden="true" />
				{m.user_2fa_back_to_settings()}
			</Link>

			<UserPageHeader eyebrow={m.user_2fa_section_heading()} title={title} description={stepDescription(step, isEnable)} />

			<StepIndicator steps={steps} current={step} />

			<UserSurface>
				{step === "password" && (
					<TwoFactorPasswordStep
						isPending={isEnable ? enableMutation.isPending : generateBackupCodesMutation.isPending}
						onSubmit={(password) => detach(handlePassword(password))}
						onCancel={goToSettings}
					/>
				)}

				{step === "verify" && totpUri && (
					<TwoFactorVerifyStep
						totpUri={totpUri}
						isPending={verifyMutation.isPending}
						onSubmit={(code) => detach(handleVerify(code))}
						onCancel={goToSettings}
					/>
				)}

				{step === "backup" && <TwoFactorBackupStep backupCodes={backupCodes} isNewlyEnabled={isEnable} onFinish={goToSettings} />}
			</UserSurface>
		</main>
	);
}
