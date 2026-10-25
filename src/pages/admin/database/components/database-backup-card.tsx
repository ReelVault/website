import { ArchiveRestore, Clock, Database, Download, Trash2 } from "lucide-react";
import { getReelVaultApiUrl } from "@/client/client";
import { ConfirmAction } from "@/components/confirm-action";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";
import { formatFileSize } from "@/utils/file-utils";
import { formatFullDateTime } from "@/utils/format-utils";
import type { BackupItem } from "./database-stats-grid";

interface DatabaseBackupCardProps {
	backup: BackupItem;
	isPending: boolean;
	onDelete: (fileName: string) => void;
	onRestore: (fileName: string) => void;
	restorePending: boolean;
}

/** Opens the backup as a file download through the API, so the browser keeps the admin session. */
function downloadUrl(fileName: string): string {
	return `${getReelVaultApiUrl()}/v1/admin/database/backups/${encodeURIComponent(fileName)}/download`;
}

export function DatabaseBackupCard({ backup, isPending, onDelete, onRestore, restorePending }: DatabaseBackupCardProps) {
	return (
		<div className="border-border/80 bg-card/60 hover:border-primary/40 flex flex-col gap-3 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-center gap-3.5">
				<div className="border-primary/20 bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg border">
					<Database className="size-4" />
				</div>
				<div className="min-w-0">
					<h3 className="text-foreground truncate font-mono text-sm font-semibold">{backup.fileName}</h3>
					<p className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-2 text-xs">
						<span className="flex items-center gap-1">
							<Clock className="size-3" />
							{formatFullDateTime(backup.createdAt)}
						</span>
						<span>{m.common_dot_separator()}</span>
						<span className="text-foreground font-mono">{formatFileSize(backup.sizeBytes)}</span>
					</p>
				</div>
			</div>

			<div className="flex shrink-0 items-center gap-2">
				<Button variant="ghost" size="sm" onClick={() => window.open(downloadUrl(backup.fileName), "_blank", "noopener,noreferrer")}>
					<Download className="size-3.5" />
					{m.admin_database_download()}
				</Button>
				<ConfirmAction
					trigger={
						<Button variant="ghost" size="sm" disabled={restorePending}>
							<ArchiveRestore className="size-3.5" />
							{m.admin_database_restore()}
						</Button>
					}
					title={m.admin_database_restore_title({ name: backup.fileName })}
					description={m.admin_database_restore_description()}
					confirmLabel={m.admin_database_restore()}
					onConfirm={() => onRestore(backup.fileName)}
				/>
				<ConfirmAction
					trigger={
						<Button variant="destructive-ghost" size="sm" disabled={isPending}>
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
