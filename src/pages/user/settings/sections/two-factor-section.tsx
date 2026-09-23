import { cn } from "cn";
import { KeyRound, ShieldAlert, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserSectionTitle, UserSurface } from "@/pages/user/components/user-ui";
import { m } from "@/paraglide/messages";
import { TwoFactorDisableDialog } from "../components/two-factor-disable-dialog";
import { TwoFactorSetupDialog } from "../components/two-factor-setup-dialog";

export function TwoFactorSection({ twoFactorEnabled }: { twoFactorEnabled: boolean }) {
	const [isSetupOpen, setIsSetupOpen] = useState(false);
	const [isDisableOpen, setIsDisableOpen] = useState(false);

	return (
		<section>
			<UserSectionTitle title={m.user_2fa_section_heading()} description={m.user_add_totp_layer()} />
			<UserSurface className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-4">
					<div
						className={cn("flex size-12 shrink-0 items-center justify-center rounded-2xl", {
							"bg-success/10 text-success": twoFactorEnabled,
							"bg-primary/10 text-primary": !twoFactorEnabled,
						})}
					>
						{twoFactorEnabled ? <ShieldCheck className="size-6" /> : <ShieldAlert className="size-6" />}
					</div>
					<div>
						<div className="flex items-center gap-3">
							<h3 className="font-bold text-foreground text-sm">{twoFactorEnabled ? m.user_2fa_active() : m.user_2fa_disabled()}</h3>
							<span
								className={cn("rounded-full px-2 py-0.5 font-bold text-[10px] uppercase tracking-wider", {
									"bg-success/10 text-success": twoFactorEnabled,
									"bg-muted text-muted-foreground": !twoFactorEnabled,
								})}
							>
								{twoFactorEnabled ? m.user_2fa_status_active() : m.common_none()}
							</span>
						</div>
						<p className="mt-1 text-muted-foreground text-xs">
							{twoFactorEnabled ? m.user_new_device_code_note() : m.user_protect_account_2fa()}
						</p>
					</div>
				</div>

				<div>
					{twoFactorEnabled ? (
						<Button
							variant="outline"
							onClick={() => setIsDisableOpen(true)}
							className="min-h-10 text-destructive hover:bg-destructive/10 hover:text-destructive"
						>
							{m.user_disable_2fa()}
						</Button>
					) : (
						<Button onClick={() => setIsSetupOpen(true)} className="min-h-10 gap-2">
							<KeyRound className="size-4" />
							{m.user_enable_2fa()}
						</Button>
					)}
				</div>
			</UserSurface>

			<TwoFactorSetupDialog open={isSetupOpen} onOpenChange={setIsSetupOpen} />
			<TwoFactorDisableDialog open={isDisableOpen} onOpenChange={setIsDisableOpen} />
		</section>
	);
}
