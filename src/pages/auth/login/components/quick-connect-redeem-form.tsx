import { ArrowRight, KeyRound, QrCode as QrCodeIcon } from "lucide-react";
import { useState } from "react";
import { useQuickConnectRedeem } from "@/client/hooks/use-auth";
import { AppErrorState } from "@/components/app-states";
import { AsyncButton } from "@/components/async-button";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { m } from "@/paraglide/messages";

interface QuickConnectRedeemFormProps {
	onSuccess: () => void;
	onSwitchToPair: () => void;
	isInitiatingPair: boolean;
}

export function QuickConnectRedeemForm({ onSuccess, onSwitchToPair, isInitiatingPair }: QuickConnectRedeemFormProps) {
	const quickConnectRedeemMutation = useQuickConnectRedeem();
	const [qcCode, setQcCode] = useState("");

	const handleQcCodeChange = (value: string) => {
		const raw = value
			.replace(/[^0-9a-zA-Z]/g, "")
			.toUpperCase()
			.slice(0, 8);
		if (raw.length > 4) {
			setQcCode(`${raw.slice(0, 4)}-${raw.slice(4)}`);
		} else {
			setQcCode(raw);
		}
	};

	const handleQuickConnectRedeem = (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (quickConnectRedeemMutation.isPending || !qcCode.trim()) return;

		quickConnectRedeemMutation.mutate(qcCode.trim(), {
			onSuccess: () => {
				onSuccess();
			},
			// Errors surface through quickConnectRedeemMutation.isError above.
		});
	};

	return (
		<form onSubmit={handleQuickConnectRedeem} className="flex flex-col gap-6" name="login-quick-connect">
			{quickConnectRedeemMutation.isError && <AppErrorState title={m.auth_code_login_error()} error={quickConnectRedeemMutation.error} />}

			<FieldGroup>
				<Field>
					<Label htmlFor="login-qc-code">{m.auth_quick_connect_code()}</Label>
					<InputGroup>
						<InputGroupAddon>
							<KeyRound className="size-4" aria-hidden="true" />
						</InputGroupAddon>
						<InputGroupInput
							id="login-qc-code"
							name="qcCode"
							type="text"
							value={qcCode}
							onChange={(e) => handleQcCodeChange(e.target.value)}
							placeholder="np. AB2C-9FGH"
							className="text-center font-bold font-mono text-lg uppercase tracking-widest"
							maxLength={9}
							autoFocus
						/>
					</InputGroup>
					<FieldDescription>{m.auth_enter_profile_code()}</FieldDescription>
				</Field>
			</FieldGroup>

			<AsyncButton
				type="submit"
				className="w-full rounded-2xl py-5 font-black uppercase tracking-widest"
				isPending={quickConnectRedeemMutation.isPending}
				disabled={qcCode.replace(/[^0-9a-zA-Z]/g, "").length < 8}
				pendingLabel={m.common_signing_in()}
			>
				{m.auth_login_with_code_btn()}
				<ArrowRight data-icon="inline-end" className="size-4" aria-hidden="true" />
			</AsyncButton>

			<Button
				type="button"
				variant="outline"
				className="w-full gap-2 rounded-2xl py-5 font-bold"
				onClick={onSwitchToPair}
				disabled={isInitiatingPair}
			>
				<QrCodeIcon className="size-4" />
				{m.auth_show_qr_pairing_tv()}
			</Button>
		</form>
	);
}
