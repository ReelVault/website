import { CheckCircle2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { copyToClipboard } from "@/utils/clipboard-utils";

interface TwoFactorBackupStepProps {
	backupCodes: string[];
	onFinish: () => void;
}

export function TwoFactorBackupStep({ backupCodes, onFinish }: TwoFactorBackupStepProps) {
	return (
		<div className="flex flex-col gap-4 py-2">
			<div className="flex items-center gap-2 text-success">
				<CheckCircle2 className="size-5" />
				<span className="font-semibold text-sm">{m.user_2fa_activated()}</span>
			</div>

			<div className="flex flex-col gap-2">
				<span className="font-bold text-muted-foreground text-xs uppercase tracking-wider">{m.user_backup_codes_heading()}</span>
				<div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-muted/40 p-3 font-mono text-xs">
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
					detach(copyToClipboard(backupCodes.join("\n"), "kody zapasowe"));
				}}
				className="gap-2"
			>
				<Copy className="size-4" />
				{m.user_settings_copy_all_backup_codes()}
			</Button>

			<DialogFooter className="mt-4">
				<Button onClick={onFinish}>{m.common_finish()}</Button>
			</DialogFooter>
		</div>
	);
}
