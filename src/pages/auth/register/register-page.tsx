import { ParaglideMessage } from "@inlang/paraglide-js-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, IdCard, Lock, Mail } from "lucide-react";
import { type ReactNode, useState } from "react";
import { useRegister } from "@/client/hooks/use-auth";
import { AppErrorState } from "@/components/app-states";
import { AsyncButton } from "@/components/async-button";
import { Logo } from "@/components/logo";
import { SimpleAnimation } from "@/components/simple-animation";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { detach } from "@/lib/detach";
import { useSpatialNavigation } from "@/lib/use-spatial-navigation";
import { m } from "@/paraglide/messages";

const MIN_PASSWORD_LENGTH = 8;

type InlineMarkupRenderer = (props: { children?: ReactNode }) => ReactNode;

// Module-level renderers keep the markup object identity stable across renders.
const joinBrandMarkup: { brand: InlineMarkupRenderer } = {
	brand: ({ children }) => <span className="text-primary">{children}</span>,
};

const alreadyHaveAccountMarkup: { link: InlineMarkupRenderer } = {
	link: ({ children }) => (
		<Link className="font-bold text-foreground underline decoration-primary/50 underline-offset-4 hover:text-primary" to="/auth/login">
			{children}
		</Link>
	),
};

// FormData.get returns `string | File | null`; only plain string fields are
// meaningful here, so anything else is treated as missing.
const getFormValue = (data: FormData, key: string): string => {
	const value = data.get(key);

	return typeof value === "string" ? value : "";
};

export default function RegisterPage() {
	useSpatialNavigation();
	const navigate = useNavigate();
	const registerMutation = useRegister();
	const [showPassword, setShowPassword] = useState(false);

	const submitRegistration = async (values: { username: string; email: string; password: string }) => {
		try {
			await registerMutation.mutateAsync(values);
			await navigate({ to: "/auth/login" });
		} catch {
			// The mutation state is rendered in the shared error surface below.
		}
	};

	const handleRegister = (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		detach(
			submitRegistration({
				username: getFormValue(formData, "username"),
				email: getFormValue(formData, "email"),
				password: getFormValue(formData, "password"),
			}),
		);
	};

	return (
		<div className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-background px-4 py-10">
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute top-[20%] right-[-10%] size-125 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_12%,transparent)_0%,transparent_70%)]" />
				<div className="absolute bottom-[-20%] left-[10%] size-100 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--secondary)_12%,transparent)_0%,transparent_70%)]" />
			</div>

			<Link to="/" className="absolute top-5 left-5 z-10 rounded-md p-1 focus-visible:outline-2">
				<Logo className="w-52" />
			</Link>

			<main className="relative z-10 w-full max-w-xl">
				<SimpleAnimation direction="up" duration={260}>
					<section className="relative overflow-hidden rounded-3xl border border-border bg-card/75 p-8 shadow-2xl sm:p-12">
						<header className="flex flex-col gap-3 text-center">
							<h1 className="font-black text-4xl tracking-tight sm:text-5xl">
								<ParaglideMessage message={m.auth_join_brand} markup={joinBrandMarkup} />
							</h1>
							<p className="font-semibold text-muted-foreground text-xs uppercase tracking-[0.2em]">{m.auth_create_system_profile()}</p>
						</header>

						<form onSubmit={handleRegister} className="mt-10 flex flex-col gap-6" name="register" autoComplete="on">
							{registerMutation.isError && <AppErrorState title={m.auth_registration_error()} error={registerMutation.error} />}
							<FieldGroup>
								<div className="grid gap-5 md:grid-cols-2">
									<Field>
										<Label htmlFor="register-username">{m.auth_username()}</Label>
										<InputGroup>
											<InputGroupAddon>
												<IdCard className="size-4" aria-hidden="true" />
											</InputGroupAddon>
											<InputGroupInput
												id="register-username"
												name="username"
												autoComplete="username"
												required
												minLength={3}
												placeholder={m.admin_users_user_word()}
											/>
										</InputGroup>
									</Field>
									<Field>
										<Label htmlFor="register-email">{m.auth_email_address()}</Label>
										<InputGroup>
											<InputGroupAddon>
												<Mail className="size-4" aria-hidden="true" />
											</InputGroupAddon>
											<InputGroupInput
												id="register-email"
												name="email"
												type="email"
												autoComplete="email"
												required
												placeholder={m.auth_email_address()}
											/>
										</InputGroup>
									</Field>
								</div>
								<Field>
									<Label htmlFor="register-password">{m.app_password()}</Label>
									<InputGroup>
										<InputGroupAddon>
											<Lock className="size-4" aria-hidden="true" />
										</InputGroupAddon>
										<InputGroupInput
											id="register-password"
											name="password"
											type={showPassword ? "text" : "password"}
											autoComplete="new-password"
											required
											minLength={MIN_PASSWORD_LENGTH}
											aria-describedby="register-password-description"
											placeholder={m.app_password()}
										/>
										<InputGroupButton
											type="button"
											size="icon-sm"
											aria-label={showPassword ? m.auth_hide_password() : m.auth_show_password()}
											aria-pressed={showPassword}
											onClick={() => setShowPassword((visible) => !visible)}
										>
											{showPassword ? m.auth_hide() : m.auth_show()}
										</InputGroupButton>
									</InputGroup>
									<FieldDescription id="register-password-description">
										{m.auth_min_password_length({ MIN_PASSWORD_LENGTH })}
									</FieldDescription>
								</Field>
							</FieldGroup>

							<AsyncButton
								type="submit"
								className="mt-2 w-full rounded-2xl py-5 font-black uppercase tracking-widest"
								isPending={registerMutation.isPending}
								pendingLabel={m.auth_register_pending()}
							>
								{m.auth_register_submit()}
								<ArrowRight data-icon="inline-end" className="size-4" aria-hidden="true" />
							</AsyncButton>

							<p className="text-center font-medium text-muted-foreground text-xs">
								<ParaglideMessage message={m.auth_already_have_account_login} markup={alreadyHaveAccountMarkup} />
							</p>
						</form>
						<div className="pointer-events-none absolute top-0 left-0 -z-10 size-full overflow-hidden rounded-3xl">
							<div className="absolute -top-10 -right-10 size-32 rounded-full bg-primary/5 blur-3xl" />
						</div>
					</section>
				</SimpleAnimation>
			</main>
		</div>
	);
}
