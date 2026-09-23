import { KeyRound, Sparkles, Tv } from "lucide-react";
import { useState } from "react";
import { getSdkErrorMessage } from "@/client/client";
import { useQuickConnectAuthorize } from "@/client/hooks/use-auth";
import { AsyncButton } from "@/components/async-button";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";

interface QuickConnectAuthorizeBoxProps {
	initialCode?: string;
	onSessionChange?: () => void;
}

export function QuickConnectAuthorizeBox({ initialCode, onSessionChange }: QuickConnectAuthorizeBoxProps) {
	const authorizeMutation = useQuickConnectAuthorize();
	const [authorizeCode, setAuthorizeCode] = useState(initialCode ?? "");

	// Format code input with dash: XXX-XXX
	const handleAuthorizeCodeChange = (value: string) => {
		const raw = value
			.replace(/[^0-9a-zA-Z]/g, "")
			.toUpperCase()
			.slice(0, 6);
		if (raw.length > 3) {
			setAuthorizeCode(`${raw.slice(0, 3)}-${raw.slice(3)}`);
		} else {
			setAuthorizeCode(raw);
		}
	};

	const handleAuthorize = (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (authorizeMutation.isPending || !authorizeCode.trim()) return;

		authorizeMutation.mutate(authorizeCode.trim(), {
			onSuccess: () => {
				toast.success(m.auth_device_linked_success());
				setAuthorizeCode("");
				onSessionChange?.();
			},
			onError: (error) => {
				toast.error(getSdkErrorMessage(error));
			},
		});
	};

	return (
		<div className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm">
			<form onSubmit={handleAuthorize} className="flex flex-col gap-4">
				<div className="flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
						<Tv className="size-5" aria-hidden="true" />
					</div>
					<div>
						<h3 className="font-bold text-sm">{m.auth_authorize_device()}</h3>
						<p className="text-muted-foreground text-xs">{m.auth_enter_code_from_screen()}</p>
					</div>
				</div>

				<FieldGroup>
					<Field>
						<Label htmlFor="authorize-device-code">{m.auth_device_code()}</Label>
						<InputGroup>
							<InputGroupAddon>
								<KeyRound className="size-4" aria-hidden="true" />
							</InputGroupAddon>
							<InputGroupInput
								id="authorize-device-code"
								type="text"
								value={authorizeCode}
								onChange={(e) => handleAuthorizeCodeChange(e.target.value)}
								placeholder={m.auth_quick_connect_code_placeholder()}
								className="font-mono uppercase tracking-wider"
								maxLength={7}
							/>
						</InputGroup>
						<FieldDescription>{m.auth_enter_login_code()}</FieldDescription>
					</Field>
				</FieldGroup>

				<AsyncButton
					type="submit"
					className="w-full rounded-xl"
					disabled={authorizeCode.replace(/[^0-9a-zA-Z]/g, "").length < 6}
					isPending={authorizeMutation.isPending}
					pendingLabel={m.admin_metadata_linking()}
				>
					<Sparkles className="size-4" aria-hidden="true" />
					{m.auth_connect_device()}
				</AsyncButton>
			</form>
		</div>
	);
}
