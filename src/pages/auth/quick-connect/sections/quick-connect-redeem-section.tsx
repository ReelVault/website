import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, KeyRound, Tv } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { AppErrorState } from "@/components/app-states";
import { AsyncButton } from "@/components/async-button";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { formatQuickConnectCode } from "@/utils/form-utils";

interface QuickConnectRedeemSectionProps {
	initialCode?: string;
	onRedeem: (code: string) => Promise<void> | void;
	isPending: boolean;
	error: Error | null;
	onSwitchToPair: () => void;
}

export function QuickConnectRedeemSection({
	initialCode = "",
	onRedeem,
	isPending,
	error,
	onSwitchToPair,
}: QuickConnectRedeemSectionProps) {
	const [manualCode, setManualCode] = useState(initialCode);

	const handleManualCodeChange = (value: string) => {
		setManualCode(formatQuickConnectCode(value));
	};

	const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!manualCode.trim() || isPending) return;

		const result = onRedeem(manualCode.trim());
		if (result instanceof Promise) {
			detach(result);
		}
	};

	return (
		<section className="border-border bg-card/85 relative overflow-hidden rounded-3xl border p-8 shadow-2xl sm:p-10">
			<header className="flex flex-col gap-3 text-center">
				<div className="border-primary/20 bg-primary/10 text-primary mx-auto flex size-14 items-center justify-center rounded-2xl border">
					<KeyRound className="size-7" />
				</div>
				<h1 className="text-3xl font-black tracking-tight sm:text-4xl">{m.auth_code_login_heading()}</h1>
				<p className="text-muted-foreground text-xs font-medium">{m.auth_enter_one_time_code()}</p>
			</header>

			<form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
				{Boolean(error) && <AppErrorState title={m.auth_login_error()} error={error} />}

				<FieldGroup>
					<Field>
						<Label htmlFor="manual-qc-code">{m.auth_quick_connect_code()}</Label>
						<InputGroup>
							<InputGroupAddon>
								<KeyRound className="size-4" />
							</InputGroupAddon>
							<InputGroupInput
								id="manual-qc-code"
								type="text"
								value={manualCode}
								onChange={(e) => handleManualCodeChange(e.target.value)}
								placeholder={m.auth_quick_connect_code_placeholder()}
								font="mono"
								className="text-center"
								maxLength={7}
								autoFocus
							/>
						</InputGroup>
						<FieldDescription>{m.auth_enter_other_device_code()}</FieldDescription>
					</Field>
				</FieldGroup>

				<AsyncButton
					type="submit"
					className="w-full rounded-2xl py-5 font-black tracking-widest uppercase"
					disabled={manualCode.replace(/[^0-9a-zA-Z]/g, "").length < 6}
					isPending={isPending}
					pendingLabel={m.common_signing_in()}
				>
					{m.auth_login_with_code_btn()}
					<ArrowRight data-icon="inline-end" className="size-4" />
				</AsyncButton>

				<div className="flex flex-col gap-2">
					<Button type="button" variant="outline" onClick={onSwitchToPair}>
						<Tv className="size-4" />
						{m.auth_show_this_device_qr()}
					</Button>

					<Link to="/auth/login" className="text-center">
						<Button tone="muted" type="button" variant="ghost" size="sm">
							<ArrowLeft className="size-4" />
							{m.auth_back_to_password_login()}
						</Button>
					</Link>
				</div>
			</form>
		</section>
	);
}
