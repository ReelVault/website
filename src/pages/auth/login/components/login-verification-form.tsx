import { ArrowLeft, ArrowRight, Key } from "lucide-react";
import { useState } from "react";
import { AppErrorState } from "@/components/app-states";
import { AsyncButton } from "@/components/async-button";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";

type VerificationMethod = "totp" | "backup";

interface VerifyMutation {
	isError: boolean;
	isPending: boolean;
	error: Error | null;
	mutateAsync: (code: string) => Promise<unknown>;
}

const sanitizeCode = (value: string, method: VerificationMethod): string =>
	method === "totp" ? value.replace(/\D/g, "").slice(0, 6) : value.trim().slice(0, 24);

/** Krok "verification": kod TOTP / kod zapasowy. */
export function LoginVerificationForm({
	email,
	totpMutation,
	backupMutation,
	onVerified,
	onBack,
}: {
	/** Hidden "username" field — lets password managers associate the OTP with the login item. */
	email: string;
	totpMutation: VerifyMutation;
	backupMutation: VerifyMutation;
	onVerified: () => void;
	onBack: () => void;
}) {
	const [method, setMethod] = useState<VerificationMethod>("totp");
	const [code, setCode] = useState("");

	const verifyMutation = method === "totp" ? totpMutation : backupMutation;

	const handleMethodToggle = () => {
		setMethod((current) => (current === "totp" ? "backup" : "totp"));
		setCode("");
	};

	const verify = async () => {
		try {
			await verifyMutation.mutateAsync(code);
			onVerified();
		} catch {
			// The mutation state is rendered in the shared error surface below.
		}
	};

	const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (verifyMutation.isPending) return;

		detach(verify());
	};

	return (
		<form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-6" name="login-2fa" autoComplete="on">
			{/* Hidden but present in the DOM so password managers can match this
			    form back to the login item used on the previous step and offer
			    to autofill the stored TOTP code. Do not remove. */}
			<input type="email" name="username" autoComplete="username" value={email} readOnly hidden aria-hidden="true" tabIndex={-1} />

			{verifyMutation.isError && verifyMutation.error && <AppErrorState title={m.auth_invalid_code()} error={verifyMutation.error} />}
			<FieldGroup>
				<Field>
					<Label htmlFor="login-2fa-code">{method === "totp" ? m.auth_method_totp_label() : m.auth_method_backup_code_label()}</Label>
					<InputGroup>
						<InputGroupAddon>
							<Key className="size-4" aria-hidden="true" />
						</InputGroupAddon>
						<InputGroupInput
							id="login-2fa-code"
							name="otp"
							type="text"
							inputMode={method === "totp" ? "numeric" : "text"}
							pattern={method === "totp" ? "[0-9]*" : undefined}
							autoComplete="one-time-code"
							value={code}
							onChange={(event) => setCode(sanitizeCode(event.target.value, method))}
							placeholder={method === "totp" ? m.auth_digits_placeholder() : "xxxxxxxx-xxxxxxxx"}
							aria-describedby="login-2fa-code-description"
							autoFocus
						/>
					</InputGroup>
					<FieldDescription id="login-2fa-code-description">
						{method === "totp" ? m.auth_enter_authenticator_code() : m.auth_use_one_backup_code()}
					</FieldDescription>
				</Field>
			</FieldGroup>

			<AsyncButton
				type="submit"
				className="w-full rounded-2xl py-5 font-black uppercase tracking-widest"
				isPending={verifyMutation.isPending}
				disabled={method === "totp" ? code.length !== 6 : code.length === 0}
				pendingLabel={m.auth_verifying()}
			>
				{m.auth_verify_and_login_btn()}
				<ArrowRight data-icon="inline-end" className="size-4" aria-hidden="true" />
			</AsyncButton>

			<Button type="button" variant="ghost" onClick={handleMethodToggle}>
				{method === "totp" ? m.auth_use_backup_code() : m.auth_use_app_code()}
			</Button>

			<Button
				type="button"
				variant="ghost"
				className="text-muted-foreground"
				onClick={() => {
					setCode("");
					onBack();
				}}
			>
				<ArrowLeft className="size-4" />
				{m.auth_back_to_login()}
			</Button>
		</form>
	);
}
