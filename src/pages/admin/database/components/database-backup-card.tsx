import { Clock, Database, Trash2 } from "lucide-react";
import type { useAdminBackups } from "@/client/hooks/use-admin-backups";
import { ConfirmAction } from "@/components/confirm-action";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";
import { formatFileSize } from "@/utils/file-utils";
import { formatFullDateTime } from "@/utils/format-utils";

type BackupItem = ReturnType<typeof useAdminBackups>["backups"][number];

interface DatabaseBackupCardProps {
	backup: BackupItem;
	isPending: boolean;
	onDelete: (fileName: string) => void;
}

export function DatabaseBackupCard({ backup, isPending, onDelete }: DatabaseBackupCardProps) {
	return (
		<div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card/60 p-4 transition-colors hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-center gap-3.5">
				<div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
					<Database className="size-4" />
				</div>
				<div className="min-w-0">
					<h3 className="truncate font-mono font-semibold text-foreground text-sm">{backup.fileName}</h3>
					<p className="mt-0.5 flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
						<span className="flex items-center gap-1">
							<Clock className="size-3" />
							{formatFullDateTime(backup.createdAt)}
						</span>
						<span>{m.common_dot_separator()}</span>
						<span className="font-mono text-foreground">{formatFileSize(backup.sizeBytes)}</span>
					</p>
				</div>
			</div>

			<div className="flex shrink-0 items-center gap-2">
				<ConfirmAction
					trigger={
						<Button
							variant="ghost"
							size="sm"
							disabled={isPending}
							className="gap-1.5 text-destructive text-xs hover:bg-destructive/10 hover:text-destructive"
						>
							<Trash2 className="size-3.5" />
							{m.common_delete()}
						</Button>
					}
					title={m.admin_database_delete_named_confirm({ fileName: backup.fileName })}
					description={m.admin_database_delete_disk_notice()}
					confirmLabel={m.admin_database_delete_backup()}
					onConfirm={() => onDelete(backup.fileName)}
				/>
			</div>
		</div>
	);
}
