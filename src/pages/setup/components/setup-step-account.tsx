import { Lock, Mail, User } from "lucide-react";
import { Field, FieldDescription, FieldError, FieldGroup } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { m } from "@/paraglide/messages";

export type SetupAccountField = "name" | "email" | "password" | "confirmPassword";

interface SetupStepAccountProps {
	name: string;
	email: string;
	password: string;
	confirmPassword: string;
	errors?: Partial<Record<SetupAccountField, string>>;
	onUpdate: (field: SetupAccountField, value: string) => void;
}

export function SetupStepAccount({ name, email, password, confirmPassword, errors, onUpdate }: SetupStepAccountProps) {
	return (
		<FieldGroup>
			<Field data-invalid={errors?.name ? true : undefined}>
				<Label htmlFor="setup-name">{m.setup_admin_name_label()}</Label>
				<InputGroup>
					<InputGroupAddon>
						<User className="size-4" aria-hidden="true" />
					</InputGroupAddon>
					<InputGroupInput
						id="setup-name"
						value={name}
						onChange={(event) => onUpdate("name", event.target.value)}
						autoComplete="name"
						aria-invalid={errors?.name ? true : undefined}
						required
					/>
				</InputGroup>
				{errors?.name && <FieldError>{errors.name}</FieldError>}
			</Field>
			<Field data-invalid={errors?.email ? true : undefined}>
				<Label htmlFor="setup-email">{m.setup_email_address()}</Label>
				<InputGroup>
					<InputGroupAddon>
						<Mail className="size-4" aria-hidden="true" />
					</InputGroupAddon>
					<InputGroupInput
						id="setup-email"
						type="email"
						value={email}
						onChange={(event) => onUpdate("email", event.target.value)}
						autoComplete="email"
						aria-invalid={errors?.email ? true : undefined}
						required
					/>
				</InputGroup>
				{errors?.email && <FieldError>{errors.email}</FieldError>}
			</Field>
			<Field data-invalid={errors?.password ? true : undefined}>
				<Label htmlFor="setup-password">{m.setup_password_label()}</Label>
				<InputGroup>
					<InputGroupAddon>
						<Lock className="size-4" aria-hidden="true" />
					</InputGroupAddon>
					<InputGroupInput
						id="setup-password"
						type="password"
						value={password}
						onChange={(event) => onUpdate("password", event.target.value)}
						autoComplete="new-password"
						aria-invalid={errors?.password ? true : undefined}
						required
					/>
				</InputGroup>
				{errors?.password ? <FieldError>{errors.password}</FieldError> : <FieldDescription>{m.setup_min_8_chars()}</FieldDescription>}
			</Field>
			<Field data-invalid={errors?.confirmPassword ? true : undefined}>
				<Label htmlFor="setup-confirm-password">{m.setup_repeat_password()}</Label>
				<InputGroup>
					<InputGroupAddon>
						<Lock className="size-4" aria-hidden="true" />
					</InputGroupAddon>
					<InputGroupInput
						id="setup-confirm-password"
						type="password"
						value={confirmPassword}
						onChange={(event) => onUpdate("confirmPassword", event.target.value)}
						autoComplete="new-password"
						aria-invalid={errors?.confirmPassword ? true : undefined}
						required
					/>
				</InputGroup>
				{errors?.confirmPassword && <FieldError>{errors.confirmPassword}</FieldError>}
			</Field>
		</FieldGroup>
	);
}
