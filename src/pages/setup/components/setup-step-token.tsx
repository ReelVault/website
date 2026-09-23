import { Key } from "lucide-react";
import { Field, FieldDescription, FieldError, FieldGroup } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { m } from "@/paraglide/messages";

interface SetupStepTokenProps {
	value: string;
	onChange: (value: string) => void;
	error?: string;
}

export function SetupStepToken({ value, onChange, error }: SetupStepTokenProps) {
	return (
		<FieldGroup>
			<Field data-invalid={error ? true : undefined}>
				<Label htmlFor="setup-token">{m.setup_token_label()}</Label>
				<InputGroup>
					<InputGroupAddon>
						<Key className="size-4" aria-hidden="true" />
					</InputGroupAddon>
					<InputGroupInput
						id="setup-token"
						value={value}
						onChange={(event) => onChange(event.target.value)}
						autoComplete="off"
						aria-invalid={error ? true : undefined}
						required
					/>
				</InputGroup>
				{error ? <FieldError>{error}</FieldError> : <FieldDescription>{m.setup_token_in_logs_hint()}</FieldDescription>}
			</Field>
		</FieldGroup>
	);
}
