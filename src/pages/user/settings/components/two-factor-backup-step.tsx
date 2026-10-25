import { CheckCircle2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { copyToClipboard } from "@/utils/clipboard-utils";

interface TwoFactorBackupStepProps {
	backupCodes: string[];
	isNewlyEnabled: boolean;
	onFinish: () => void;
}

export function TwoFactorBackupStep({ backupCodes, isNewlyEnabled, onFinish }: TwoFactorBackupStepProps) {
	return (
		<div className="flex flex-col gap-4 py-2">
			{isNewlyEnabled && (
				<div className="text-success flex items-center gap-2">
					<CheckCircle2 className="size-5" />
					<span className="text-sm font-semibold">{m.user_2fa_activated()}</span>
				</div>
			)}

			<div className="flex flex-col gap-2">
				<span className="text-muted-foreground text-sm font-semibold">{m.user_backup_codes_heading()}</span>
				<div className="border-border bg-muted/40 grid grid-cols-2 gap-2 rounded-xl border p-3 font-mono text-sm sm:text-base">
					{backupCodes.map((c) => (
						<span key={c} className="text-foreground">
							{c}
						</span>
					))}
				</div>
			</div>

			<Button
				type="button"
				variant="outline"
				onClick={() => {
					detach(copyToClipboard(backupCodes.join("\n"), m.user_backup_codes_heading()));
				}}
			>
				<Copy className="size-4" />
				{m.user_settings_copy_all_backup_codes()}
			</Button>

			<div className="flex justify-end pt-2">
				<Button onClick={onFinish}>{m.common_finish()}</Button>
			</div>
		</div>
	);
}
