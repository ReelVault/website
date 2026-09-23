import { ParaglideMessage } from "@inlang/paraglide-js-react";
import { useNavigate, useSearch, useRouter as useTanStackRouter } from "@tanstack/react-router";
import { KeyRound, Shield, Tv } from "lucide-react";
import { type ReactNode, useState } from "react";
import { useLogin, useVerifyBackupCode, useVerifyTotp } from "@/client/hooks/use-auth";
import { SimpleAnimation } from "@/components/simple-animation";
import { detach } from "@/lib/detach";
import { useSpatialNavigation } from "@/lib/use-spatial-navigation";
import { m } from "@/paraglide/messages";
import { isTvDevice } from "@/utils/tv-device";
import { LoginBackdrop } from "./components/login-backdrop";
import { LoginCredentialsForm } from "./components/login-credentials-form";
import { LoginQuickConnectStep, type QuickConnectSubStep } from "./components/login-quick-connect";
import { LoginVerificationForm } from "./components/login-verification-form";

type LoginStep = "credentials" | "verification" | "quick-connect";

type DotMarkupRenderer = (props: { children?: ReactNode }) => ReactNode;

// Module-level renderer keeps the markup object identity stable across renders.
const welcomeTitleMarkup: { dot: DotMarkupRenderer } = {
	dot: ({ children }) => <span className="text-primary">{children}</span>,
};

export default function LoginPage() {
	// TV: arrows/D-pad move focus on the login screen too.
	useSpatialNavigation();
	const navigate = useNavigate();
	const router = useTanStackRouter();
	const loginMutation = useLogin();
	const verifyTotpMutation = useVerifyTotp();
	const verifyBackupCodeMutation = useVerifyBackupCode();

	// TV: the remote has no keyboard — start with Quick Connect pairing
	// (the credentials step stays reachable via the "Back" button in the QC step).
	const [step, setStep] = useState<LoginStep>(isTvDevice() ? "quick-connect" : "credentials");
	const [qcSubStep, setQcSubStep] = useState<QuickConnectSubStep>("pair");
	// Kept so the verification step can carry a hidden "username" field —
	// this lets password managers (Bitwarden, 1Password, ...) associate the
	// OTP field with the login item they just used, which is what enables
	// automatic 2FA code fill-in on step two.
	const [email, setEmail] = useState("");

	const { redirect: redirectUrl } = useSearch({ from: "/auth/login" });

	const navigateToProfiles = () => {
		detach(
			navigate({
				to: "/auth/profiles",
				search: redirectUrl ? { redirect: redirectUrl } : {},
			}),
		);
		detach(router.invalidate());
	};

	const handleLogin = async ({ email: emailValue, password }: { email: string; password: string }) => {
		try {
			const result = await loginMutation.mutateAsync({ email: emailValue, password });
			if (result.twoFactorRedirect) {
				setEmail(emailValue);
				setStep("verification");

				return;
			}

			navigateToProfiles();
		} catch {
			// The mutation state is rendered in the shared error surface below.
		}
	};

	const renderHeaderIcon = () => {
		if (step === "quick-connect") {
			return qcSubStep === "pair" ? <Tv className="size-8" aria-hidden="true" /> : <KeyRound className="size-8" aria-hidden="true" />;
		}

		return <Shield className="size-8" aria-hidden="true" />;
	};

	const getStepLabel = () => {
		if (step === "credentials") return m.auth_access_authorization();

		if (step === "verification") return m.auth_2fa_heading();

		return m.auth_quick_login();
	};

	const renderStepContent = () => {
		if (step === "credentials") {
			return (
				<LoginCredentialsForm
					error={loginMutation.error}
					isPending={loginMutation.isPending}
					onSubmit={handleLogin}
					onQuickConnect={() => setStep("quick-connect")}
				/>
			);
		}

		if (step === "verification") {
			return (
				<LoginVerificationForm
					email={email}
					totpMutation={verifyTotpMutation}
					backupMutation={verifyBackupCodeMutation}
					onVerified={navigateToProfiles}
					onBack={() => setStep("credentials")}
				/>
			);
		}

		return <LoginQuickConnectStep redirectUrl={redirectUrl} onSubStepChange={setQcSubStep} onBack={() => setStep("credentials")} />;
	};

	return (
		<div className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-background">
			<LoginBackdrop />

			<main className="relative z-10 w-full max-w-md px-6">
				<SimpleAnimation direction="up" duration={260}>
					<section className="relative overflow-hidden rounded-3xl border border-border bg-card/75 p-8 shadow-2xl sm:p-10">
						<header className="flex flex-col gap-4 text-center">
							<div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
								{renderHeaderIcon()}
							</div>
							<div>
								<h1 className="font-black text-4xl tracking-tight sm:text-5xl">
									<ParaglideMessage message={m.auth_welcome_title} markup={welcomeTitleMarkup} />
								</h1>
								<p className="mt-2 font-semibold text-muted-foreground text-xs uppercase tracking-[0.2em]">{getStepLabel()}</p>
							</div>
						</header>

						{renderStepContent()}

						<p className="mt-6 text-center font-medium text-muted-foreground text-xs">{m.auth_private_archive_tagline()}</p>
						<div className="pointer-events-none absolute -top-24 -left-24 size-48 rounded-full bg-primary/10 blur-[80px]" />
					</section>
				</SimpleAnimation>
			</main>
		</div>
	);
}
