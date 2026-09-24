import { ArrowRight, Lock, QrCode as QrCodeIcon, Server, User } from "lucide-react";
import { useState } from "react";
import { getStoredServerUrl, setStoredServerUrl } from "@/client/client";
import { AppErrorState } from "@/components/app-states";
import { AsyncButton } from "@/components/async-button";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { isNativeShell } from "@/lib/capacitor-native";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";

const TRAILING_SLASHES = /\/+$/;

// FormData.get returns `string | File | null`; only plain string fields are
// meaningful here, so anything else is treated as missing.
const getFormValue = (data: FormData, key: string): string => {
	const value = data.get(key);

	return typeof value === "string" ? value : "";
};

/** "credentials" step: email + password + switch to quick-connect. */
export function LoginCredentialsForm({
	error,
	isPending,
	onSubmit,
	onQuickConnect,
}: {
	error: Error | null;
	isPending: boolean;
	onSubmit: (values: { email: string; password: string }) => Promise<void>;
	onQuickConnect: () => void;
}) {
	// Native shells (Capacitor WebView, Tauri desktop) do not share the browser's
	// URL heuristics in client.ts — the user has to point at the media server.
	const isNative = isNativeShell();
	const storedServerUrl = isNative ? getStoredServerUrl() : undefined;
	// Native validation blocks submit silently; surface a localized hint instead
	// of the browser's own bubble.
	const [showRequiredHint, setShowRequiredHint] = useState(false);

	const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (isPending) return;

		const formData = new FormData(event.currentTarget);
		if (isNative) {
			const serverUrl = getFormValue(formData, "serverUrl").trim().replace(TRAILING_SLASHES, "");
			setStoredServerUrl(serverUrl || null);
		}

		detach(
			onSubmit({
				email: getFormValue(formData, "email"),
				password: getFormValue(formData, "password"),
			}),
		);
	};

	return (
		<form
			onSubmit={handleSubmit}
			onInvalid={(event) => {
				event.preventDefault();
				setShowRequiredHint(true);
			}}
			className="mt-10 flex flex-col gap-6"
			name="login"
			autoComplete="on"
		>
			{error && <AppErrorState title={m.auth_authorization_error()} error={error} />}
			{showRequiredHint && (
				<p role="alert" className="text-destructive text-sm">
					{m.auth_login_required_hint()}
				</p>
			)}
			<FieldGroup>
				{isNative && (
					<Field>
						<Label htmlFor="login-server">{m.auth_server_address()}</Label>
						<InputGroup>
							<InputGroupAddon>
								<Server className="size-4" aria-hidden="true" />
							</InputGroupAddon>
							<InputGroupInput
								id="login-server"
								name="serverUrl"
								type="url"
								inputMode="url"
								autoComplete="url"
								defaultValue={storedServerUrl ?? ""}
								placeholder="http://192.168.1.10:3030"
								autoFocus={isNative}
							/>
						</InputGroup>
					</Field>
				)}
				<Field>
					<Label htmlFor="login-email">{m.auth_email_address()}</Label>
					<InputGroup>
						<InputGroupAddon>
							<User className="size-4" aria-hidden="true" />
						</InputGroupAddon>
						<InputGroupInput
							id="login-email"
							name="email"
							type="email"
							autoComplete="username"
							required
							placeholder={m.auth_email_address()}
							autoFocus={!isNative}
						/>
					</InputGroup>
				</Field>
				<Field>
					<Label htmlFor="login-password">{m.app_password()}</Label>
					<InputGroup>
						<InputGroupAddon>
							<Lock className="size-4" aria-hidden="true" />
						</InputGroupAddon>
						<InputGroupInput
							id="login-password"
							name="password"
							type="password"
							autoComplete="current-password"
							required
							placeholder={m.app_password()}
						/>
					</InputGroup>
				</Field>
			</FieldGroup>

			<AsyncButton
				type="submit"
				className="w-full rounded-2xl py-5 font-black uppercase tracking-widest"
				isPending={isPending}
				pendingLabel={m.auth_login_pending()}
			>
				{m.auth_login_submit()}
				<ArrowRight data-icon="inline-end" className="size-4" aria-hidden="true" />
			</AsyncButton>

			<div className="relative flex items-center justify-center py-1">
				<div className="absolute inset-0 flex items-center">
					<span className="w-full border-border/60 border-t" />
				</div>
				<span className="relative bg-card/75 px-3 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
					{m.auth_or_divider()}
				</span>
			</div>

			<Button type="button" variant="outline" className="w-full gap-2 rounded-2xl py-5 font-bold" onClick={onQuickConnect}>
				<QrCodeIcon className="size-4" /> {m.auth_quick_connect_button()}
			</Button>
		</form>
	);
}
