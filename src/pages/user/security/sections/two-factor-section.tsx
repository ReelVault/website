import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { KeyRound, ShieldAlert, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useBackupCodesStatus } from "@/client/hooks/use-two-factor";
import { Button } from "@/components/ui/button";
import { UserSectionTitle, UserSurface } from "@/pages/user/components/user-ui";
import { m } from "@/paraglide/messages";
import { TwoFactorDisableDialog } from "../components/two-factor-disable-dialog";

// Setup and backup-code regeneration are full pages: the codes must stay on screen until the user confirms they saved them.
export function TwoFactorSection({ twoFactorEnabled }: { twoFactorEnabled: boolean }) {
	const [isDisableOpen, setIsDisableOpen] = useState(false);
	const backupCodesStatus = useBackupCodesStatus(twoFactorEnabled);

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
								className={cn("rounded-full px-2 py-0.5 font-bold text-xs", {
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

				{twoFactorEnabled && backupCodesStatus.data && (
					<p className="-mt-2 text-muted-foreground text-xs">
						{backupCodesStatus.data.remaining === null
							? m.user_backup_codes_unreadable()
							: m.user_backup_codes_remaining({ count: backupCodesStatus.data.remaining })}
					</p>
				)}
				<div className="flex flex-wrap gap-2">
					{twoFactorEnabled ? (
						<>
							<Button
								variant="outline"
								nativeButton={false}
								render={<Link to="/two-factor" search={{ mode: "regenerate" }} />}
								className="min-h-10"
							>
								{m.user_regenerate_backup_codes()}
							</Button>
							<Button variant="destructive-outline" onClick={() => setIsDisableOpen(true)} className="min-h-10">
								{m.user_disable_2fa()}
							</Button>
						</>
					) : (
						<Button nativeButton={false} render={<Link to="/two-factor" search={{ mode: "enable" }} />} className="min-h-10">
							<KeyRound className="size-4" />
							{m.user_enable_2fa()}
						</Button>
					)}
				</div>
			</UserSurface>

			<TwoFactorDisableDialog open={isDisableOpen} onOpenChange={setIsDisableOpen} />
		</section>
	);
}
