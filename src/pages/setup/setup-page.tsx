import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useCreateAdmin } from "@/client/hooks/use-setup";
import { useIsSetupRequired } from "@/client/hooks/use-setup-status";
import { authKeys } from "@/client/utils/query-keys";
import { AppErrorState, AppLoadingState } from "@/components/app-states";
import { AsyncButton } from "@/components/async-button";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/use-page-title";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { SetupProgress } from "./components/setup-progress";
import { SetupStepAccount } from "./components/setup-step-account";
import { SetupStepLibraries } from "./components/setup-step-libraries";
import { SetupStepPlugins } from "./components/setup-step-plugins";
import { SetupStepSuccess } from "./components/setup-step-success";
import { SetupStepSummary } from "./components/setup-step-summary";
import { SetupStepToken } from "./components/setup-step-token";

interface SetupForm {
	setupToken: string;
	name: string;
	email: string;
	password: string;
	confirmPassword: string;
}

type SetupStepId = "token" | "account" | "confirm" | "libraries" | "plugins";

const SETUP_STEP_LABELS: Record<SetupStepId, () => string> = {
	account: m.setup_step_account,
	confirm: m.setup_step_confirm,
	libraries: m.setup_step_libraries,
	plugins: m.setup_step_plugins,
	token: m.setup_step_token,
};

const SETUP_STEPS_WITH_TOKEN: readonly SetupStepId[] = ["token", "account", "confirm", "plugins", "libraries"];
const SETUP_STEPS_DEFAULT: readonly SetupStepId[] = ["account", "confirm", "plugins", "libraries"];

const INITIAL_FORM: SetupForm = { setupToken: "", name: "", email: "", password: "", confirmPassword: "" };

/**
 * Wizard steps are component state, so a refresh after the admin account was
 * created (required flips to false) would otherwise lock the remaining optional
 * steps behind the "already done" screen. The index survives in sessionStorage —
 * per-tab, like the setup-complete flag in the root guard — and is cleared once
 * the wizard finishes.
 */
const SETUP_RESUMABLE_KEY = "reelvault:setup:resumable";

function readResumableStep(): number {
	if (typeof window === "undefined") return 0;

	try {
		const parsed = Number.parseInt(window.sessionStorage.getItem(SETUP_RESUMABLE_KEY) ?? "", 10);

		return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
	} catch {
		return 0;
	}
}

function writeResumableStep(step: number): void {
	if (typeof window === "undefined") return;

	try {
		window.sessionStorage.setItem(SETUP_RESUMABLE_KEY, String(step));
	} catch {
		// Privacy mode may reject storage — resume silently degrades.
	}
}

function clearResumable(): void {
	if (typeof window === "undefined") return;

	try {
		window.sessionStorage.removeItem(SETUP_RESUMABLE_KEY);
	} catch {
		// Ignore — same as write.
	}
}

export default function SetupPage() {
	usePageTitle(m.setup_configure_reelvault());
	const [currentStep, setCurrentStep] = useState(() => readResumableStep());
	const [isFinished, setIsFinished] = useState(false);
	const [form, setForm] = useState<SetupForm>(INITIAL_FORM);
	const [error, setError] = useState<string>();
	const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof SetupForm, string>>>({});
	const { isLoading: statusLoading, isError: statusError, isRequired, tokenRequired, refetch } = useIsSetupRequired();
	const setupMutation = useCreateAdmin();
	const queryClient = useQueryClient();

	const stepOrder = tokenRequired ? SETUP_STEPS_WITH_TOKEN : SETUP_STEPS_DEFAULT;
	const stepIndex = Math.min(currentStep, stepOrder.length - 1);
	const stepId: SetupStepId = stepOrder[stepIndex] ?? "account";
	const isLastStep = stepIndex === stepOrder.length - 1;
	// Once the administrator exists the earlier steps are no longer actionable —
	// allow moving back only within the post-creation steps (never onto "confirm").
	const confirmIndex = stepOrder.indexOf("confirm");
	const canGoBack = stepIndex > 0 && (!setupMutation.isSuccess || stepIndex - 1 > confirmIndex);

	const primaryActionLabel = (): string => {
		if (stepId === "confirm") return m.app_create_account();

		if (isLastStep) return m.setup_finish();

		return m.common_next();
	};

	// The admin-backed steps render outside the wizard form: their dialogs live
	// in React portals, and a portal's `submit` bubbles through the React tree
	// into the outer form, which would skip the step on every library creation.
	const isInputStep = stepId === "token" || stepId === "account" || stepId === "confirm";

	const update = (field: keyof SetupForm, value: string) => {
		setError(undefined);
		setFieldErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
		setForm((current) => ({ ...current, [field]: value }));
	};

	const validateStep = () => {
		const errors: Partial<Record<keyof SetupForm, string>> = {};

		if (stepId === "token" && !form.setupToken.trim()) {
			errors.setupToken = m.setup_token_required();
		}

		if (stepId === "account") {
			if (!form.name.trim()) errors.name = m.setup_name_required();

			if (!form.email.trim()) errors.email = m.setup_email_required();

			if (form.password.length < 8) errors.password = m.setup_password_min_length();

			if (form.password !== form.confirmPassword) errors.confirmPassword = m.setup_passwords_must_match();
		}

		return errors;
	};

	// Persisted from the post-account steps onward so a refresh mid-wizard
	// resumes instead of hitting the "already done" screen.
	const advance = (index: number) => {
		setCurrentStep(index);
		writeResumableStep(index);
	};

	const submitSetup = async () => {
		if (setupMutation.isPending) return;

		const validationErrors = validateStep();
		const hasErrors = Object.values(validationErrors).some(Boolean);
		if (hasErrors) {
			setFieldErrors(validationErrors);

			return;
		}

		// The account must exist before the optional library/plugin steps can call
		// the admin API — create it on "confirm" and advance on success.
		if (stepId === "confirm") {
			await setupMutation.mutateAsync({
				...form,
				name: form.name.trim(),
				email: form.email.trim(),
				setupToken: form.setupToken.trim(),
			});
			// The sign-up response set the admin session cookie; drop any stale
			// "signed out" cache entry so the /dashboard auth guard refetches.
			queryClient.removeQueries({ queryKey: authKeys.me() });
			advance(stepIndex + 1);

			return;
		}

		if (isLastStep) {
			clearResumable();
			setIsFinished(true);

			return;
		}

		advance(stepIndex + 1);
	};

	// Non-async wrapper: React event handlers must return void; failures surface
	// through setupMutation state (isError) and the detached logger.
	const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		detach(submitSetup());
	};

	const stepFooter = (
		<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
			<Button
				type="button"
				variant="outline"
				disabled={!canGoBack || setupMutation.isPending}
				onClick={() => setCurrentStep(stepIndex - 1)}
			>
				<ArrowLeft className="size-4" /> {m.common_back()}
			</Button>
			{isInputStep ? (
				<AsyncButton type="submit" className="sm:ml-auto" isPending={setupMutation.isPending} pendingLabel={m.setup_configuring()}>
					{primaryActionLabel()}
					<ArrowRight className="size-4" />
				</AsyncButton>
			) : (
				<AsyncButton type="button" className="sm:ml-auto" isPending={setupMutation.isPending} onClick={() => detach(submitSetup())}>
					{primaryActionLabel()}
					<ArrowRight className="size-4" />
				</AsyncButton>
			)}
		</div>
	);

	const renderStep = () => {
		if (isFinished) return <SetupStepSuccess />;

		if (isInputStep) {
			return (
				<form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
					{(error !== undefined || setupMutation.isError) && (
						<AppErrorState
							title={setupMutation.isError ? m.setup_failed_to_configure() : m.setup_fill_form()}
							description={error ?? (tokenRequired ? m.setup_check_token_hint() : m.setup_review_details_hint())}
						/>
					)}

					{stepId === "token" && (
						<SetupStepToken value={form.setupToken} onChange={(val) => update("setupToken", val)} error={fieldErrors.setupToken} />
					)}

					{stepId === "account" && (
						<SetupStepAccount
							name={form.name}
							email={form.email}
							password={form.password}
							confirmPassword={form.confirmPassword}
							errors={fieldErrors}
							onUpdate={update}
						/>
					)}

					{stepId === "confirm" && (
						<SetupStepSummary showToken={tokenRequired} setupToken={form.setupToken} name={form.name} email={form.email} />
					)}

					{stepFooter}
				</form>
			);
		}

		return (
			<div className="flex flex-col gap-8">
				{stepId === "plugins" && <SetupStepPlugins />}

				{stepId === "libraries" && <SetupStepLibraries />}

				{stepFooter}
			</div>
		);
	};

	if (statusLoading) return <AppLoadingState label={m.setup_checking_config()} className="min-h-svh" />;

	if (statusError) {
		return (
			<div className="flex min-h-svh items-center justify-center bg-background px-4">
				<AppErrorState
					title={m.setup_check_config_failed()}
					onRetry={() => {
						detach(refetch());
					}}
					className="max-w-md"
				/>
			</div>
		);
	}

	if (!(isRequired || setupMutation.isSuccess || readResumableStep() > 0)) {
		return (
			<div className="flex min-h-svh items-center justify-center bg-background px-4">
				<div className="flex max-w-md flex-col items-center gap-4 rounded-lg border border-border bg-card p-6 text-center">
					<h1 className="font-semibold text-xl">{m.setup_already_done()}</h1>
					<p className="text-muted-foreground text-sm">{m.setup_already_done_desc()}</p>
					<Button nativeButton={false} render={<Link to="/auth/login" />}>
						{m.setup_go_to_login()}
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-svh bg-background px-4 py-8 sm:py-12">
			<div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
				<div className="flex justify-center">
					<Logo className="w-48" />
				</div>
				<section className="flex flex-col gap-8 rounded-lg border border-border bg-card p-6 sm:p-8">
					<header className="flex flex-col gap-2">
						<p className="font-medium text-primary text-xs uppercase tracking-widest">{m.setup_first_run()}</p>
						<h1 className="font-semibold text-3xl tracking-tight">{m.setup_configure_reelvault()}</h1>
						<p className="text-muted-foreground text-sm">{m.setup_steps_desc()}</p>
					</header>

					<SetupProgress labels={stepOrder.map((id) => SETUP_STEP_LABELS[id]())} current={stepIndex} isSuccess={isFinished} />

					{renderStep()}
				</section>
			</div>
		</div>
	);
}
