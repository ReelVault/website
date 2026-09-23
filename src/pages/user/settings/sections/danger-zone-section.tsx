import { Trash2 } from "lucide-react";
import { ConfirmAction } from "@/components/confirm-action";
import { Button } from "@/components/ui/button";
import { UserSurface } from "@/pages/user/components/user-ui";
import { m } from "@/paraglide/messages";

interface DangerZoneSectionProps {
	profileName: string;
	onDelete: () => Promise<void> | void;
}

export function DangerZoneSection({ profileName, onDelete }: DangerZoneSectionProps) {
	return (
		<UserSurface className="border-destructive/40 bg-card/60">
			<div className="flex items-center gap-3">
				<span className="flex size-9 items-center justify-center rounded-xl bg-destructive/15 text-destructive text-sm">
					<Trash2 className="size-4" aria-hidden="true" />
				</span>
				<div>
					<h3 className="font-bold text-foreground text-sm">{m.user_danger_zone()}</h3>
					<p className="text-muted-foreground text-xs">{m.user_profile_deletion_irreversible()}</p>
				</div>
			</div>

			<ConfirmAction
				trigger={
					<Button type="button" variant="destructive" className="mt-5 min-h-11 gap-2">
						<Trash2 className="size-4" aria-hidden="true" /> {m.admin_users_delete_profile()}
					</Button>
				}
				title={m.user_delete_profile_confirm({ profileName })}
				description={m.user_profile_history_warning()}
				confirmLabel={m.user_delete_permanently()}
				onConfirm={async () => {
					await onDelete();
				}}
			/>
		</UserSurface>
	);
}
