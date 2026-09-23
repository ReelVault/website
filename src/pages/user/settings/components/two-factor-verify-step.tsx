import { Copy, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { copyToClipboard } from "@/utils/clipboard-utils";

interface TwoFactorVerifyStepProps {
	totpUri: string;
	isPending: boolean;
	onSubmit: (code: string) => void;
	onCancel: () => void;
}

export function TwoFactorVerifyStep({ totpUri, isPending, onSubmit, onCancel }: TwoFactorVerifyStepProps) {
	const [code, setCode] = useState("");

	const setupSecret = (() => {
		try {
			return new URL(totpUri).searchParams.get("secret");
		} catch {
			return null;
		}
	})();

	const handleSubmit = (e: React.SubmitEvent) => {
		e.preventDefault();
		if (!code || isPending) return;

		onSubmit(code);
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
			<div className="flex flex-col items-center gap-3 rounded-xl border border-border/70 bg-card p-4">
				<div className="flex items-center gap-2 font-medium text-muted-foreground text-xs">
					<QrCode className="size-4 text-primary" />
					<span>{m.user_scan_qr()}</span>
				</div>

				<div className="rounded-xl bg-white p-3">
					<QRCodeSVG value={totpUri} size={176} marginSize={0} />
				</div>

				{setupSecret && (
					<div className="flex w-full items-center gap-2">
						<Input readOnly value={setupSecret} className="h-9 font-mono text-xs" />
						<Button
							type="button"
							size="icon-sm"
							variant="outline"
							aria-label={m.user_copy_totp_key()}
							onClick={() => {
								detach(copyToClipboard(setupSecret, m.auth_copy_totp_key()));
							}}
						>
							<Copy className="size-4" />
						</Button>
					</div>
				)}

				<Button
					type="button"
					variant="ghost"
					className="text-muted-foreground text-xs"
					onClick={() => {
						detach(copyToClipboard(totpUri, m.auth_copy_totp_uri()));
					}}
				>
					{m.admin_2fa_copy_config_key()}
				</Button>
			</div>

			<div className="flex flex-col gap-2">
				<label htmlFor="2fa-verify-code" className="font-semibold text-muted-foreground text-xs uppercase">
					{m.auth_two_factor_verify_code_label()}
				</label>
				<Input
					id="2fa-verify-code"
					type="text"
					required
					maxLength={6}
					placeholder={m.auth_two_factor_code_placeholder()}
					value={code}
					onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
					className="h-11 text-center font-bold font-mono text-lg tracking-widest"
				/>
			</div>

			<DialogFooter className="mt-4">
				<Button type="button" variant="ghost" onClick={onCancel}>
					{m.common_cancel()}
				</Button>
				<Button type="submit" disabled={isPending || code.length !== 6}>
					{isPending ? m.common_verifying() : m.user_verify_and_enable()}
				</Button>
			</DialogFooter>
		</form>
	);
}
