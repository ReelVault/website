import { Lock, User } from "lucide-react";
import { Field, FieldGroup } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { m } from "@/paraglide/messages";

interface ProfileFormInputsProps {
	name: string;
	pin: string;
	onNameChange: (name: string) => void;
	onPinChange: (pin: string) => void;
}

export function ProfileFormInputs({ name, pin, onNameChange, onPinChange }: ProfileFormInputsProps) {
	return (
		<FieldGroup className="w-full">
			<Field>
				<Label htmlFor="profile-name">{m.auth_profile_name_label()}</Label>
				<InputGroup>
					<InputGroupAddon>
						<User className="size-4" aria-hidden="true" />
					</InputGroupAddon>
					<InputGroupInput
						id="profile-name"
						name="profile-name"
						autoComplete="nickname"
						placeholder={m.auth_profile_name_placeholder()}
						value={name}
						onChange={(event) => onNameChange(event.target.value)}
					/>
				</InputGroup>
			</Field>
			<Field>
				<Label htmlFor="profile-pin">{m.auth_profile_pin_optional()}</Label>
				<InputGroup>
					<InputGroupAddon>
						<Lock className="size-4" aria-hidden="true" />
					</InputGroupAddon>
					<InputGroupInput
						id="profile-pin"
						name="profile-pin"
						autoComplete="new-password"
						type="password"
						placeholder={m.auth_profile_pin_hint()}
						maxLength={8}
						value={pin}
						onChange={(event) => onPinChange(event.target.value.replace(/\D/g, ""))}
					/>
				</InputGroup>
			</Field>
		</FieldGroup>
	);
}
