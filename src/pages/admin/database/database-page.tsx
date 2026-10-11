import { cn } from "cn";
import { Database, HeartPulse, Plus, RefreshCw, Upload, Wrench } from "lucide-react";
import { type ChangeEvent, type ReactNode, useRef } from "react";
import { useAdminBackups } from "@/client/hooks/use-admin-backups";
import { useAdminSettings } from "@/client/hooks/use-admin-settings";
import { AppEmptyState, AppErrorState } from "@/components/app-states";
import { StreamBlockDialog } from "@/components/stream-block-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { detach } from "@/lib/detach";
import { AdminPageHeader, AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { DatabaseBackupCard } from "./components/database-backup-card";
import { DatabaseMigrationsSection } from "./components/database-migrations-section";
import { DatabaseStatsGrid } from "./components/database-stats-grid";

const SKELETON_KEYS = ["1", "2", "3"] as const;

export default function AdminDatabasePage() {
	const {
		backupsQuery,
		backups,
		createBackupMutation,
		deleteBackupMutation,
		uploadBackupMutation,
		restoreMutation,
		restoreBlock,
		confirmRestoreBlock,
		dismissRestoreBlock,
		integrityMutation,
		optimizeMutation,
	} = useAdminBackups();
	const { settings } = useAdminSettings();
	const uploadInputRef = useRef<HTMLInputElement>(null);
	const uploadEnabled = (settings ? Object.values(settings).flat() : []).some(
		(item) => item.key === "system.database.backupUploadEnabled" && item.value === true,
	);

	const handleRefetch = () => {
		detach(backupsQuery.refetch());
	};

	const handleCreateBackup = async () => {
		if (createBackupMutation.isPending) return;

		const backup = await createBackupMutation.mutateAsync();
		toast.success(m.admin_database_backup_created({ fileName: backup.fileName }));
	};

	const handleUploadSelected = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.currentTarget.files?.[0];
		event.currentTarget.value = "";
		if (file) uploadBackupMutation.mutate(file);
	};

	const handleDeleteBackup = async (fileName: string) => {
		if (deleteBackupMutation.isPending) return;

		await deleteBackupMutation.mutateAsync(fileName);
		toast.success(m.admin_database_backup_deleted());
	};

	let backupsContent: ReactNode;
	if (backupsQuery.isLoading) {
		backupsContent = (
			<div className="flex flex-col gap-3">
				{SKELETON_KEYS.map((key) => (
					<Skeleton key={key} className="h-16" />
				))}
			</div>
		);
	} else if (backupsQuery.isError) {
		backupsContent = <AppErrorState title={m.admin_database_failed_to_fetch_list()} error={backupsQuery.error} onRetry={handleRefetch} />;
	} else if (backups.length === 0) {
		backupsContent = <AppEmptyState title={m.admin_database_no_backups()} description={m.admin_database_first_snapshot_hint()} />;
	} else {
		backupsContent = (
			<div className="flex flex-col gap-3">
				{backups.map((backup) => (
					<DatabaseBackupCard
						key={backup.fileName}
						backup={backup}
						isPending={deleteBackupMutation.isPending}
						onDelete={(fileName) => {
							detach(handleDeleteBackup(fileName));
						}}
						onRestore={(fileName) => {
							detach(
								(async () => {
									await restoreMutation.mutateAsync({ fileName });
									toast.success(m.admin_database_restore_queued());
								})(),
							);
						}}
						restorePending={restoreMutation.isPending}
					/>
				))}
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<StreamBlockDialog
				isOpen={restoreBlock !== null}
				title={m.admin_database_stream_block_title()}
				description={m.admin_database_stream_block_description({ activeStreams: restoreBlock?.activeStreams ?? 0 })}
				confirmLabel={m.admin_database_stream_block_confirm()}
				isPending={restoreMutation.isPending}
				onConfirm={confirmRestoreBlock}
				onCancel={dismissRestoreBlock}
			/>
			<AdminPageHeader
				icon={Database}
				eyebrow={m.admin_database_engine_security()}
				title={m.admin_database_heading()}
				count={backups.length}
				description={m.admin_database_snapshots_description()}
				actions={
					<div className="flex flex-wrap items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							disabled={integrityMutation.isPending}
							onClick={() => detach(integrityMutation.mutateAsync())}
						>
							<HeartPulse className="size-3.5" />
							{m.admin_database_check_integrity()}
						</Button>
						<Button
							variant="outline"
							size="sm"
							disabled={optimizeMutation.isPending}
							onClick={() => detach(optimizeMutation.mutateAsync())}
						>
							<Wrench className="size-3.5" />
							{m.admin_database_optimize()}
						</Button>
						<Button variant="outline" size="sm" onClick={handleRefetch} disabled={backupsQuery.isFetching}>
							<RefreshCw className={cn("size-3.5", { "animate-spin": backupsQuery.isFetching })} />
							{m.common_refresh()}
						</Button>
						{uploadEnabled && (
							<>
								<input
									ref={uploadInputRef}
									type="file"
									accept=".sqlite,application/vnd.sqlite3"
									className="hidden"
									onChange={handleUploadSelected}
								/>
								<Button
									variant="outline"
									size="sm"
									disabled={uploadBackupMutation.isPending}
									onClick={() => uploadInputRef.current?.click()}
								>
									<Upload className="size-3.5" />
									{m.admin_database_upload_backup()}
								</Button>
							</>
						)}
						<Button
							size="sm"
							onClick={() => {
								detach(handleCreateBackup());
							}}
							disabled={createBackupMutation.isPending}
						>
							{createBackupMutation.isPending ? <RefreshCw className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
							{m.admin_database_create_backup()}
						</Button>
					</div>
				}
			/>

			{!uploadEnabled && <p className="text-muted-foreground text-xs">{m.admin_database_upload_disabled_hint()}</p>}

			{/* Info Cards */}
			<DatabaseStatsGrid backups={backups} />

			{integrityMutation.data ? (
				<AdminSection title={m.admin_database_integrity_title()}>
					<p className={integrityMutation.data.ok ? "text-sm text-success" : "text-destructive text-sm"}>
						{integrityMutation.data.ok ? m.admin_database_integrity_ok() : m.admin_database_integrity_problems()}
					</p>
					{integrityMutation.data.ok ? null : (
						<ul className="mt-2 list-disc pl-5 font-mono text-muted-foreground text-xs">
							{integrityMutation.data.messages.map((message) => (
								<li key={message}>{message}</li>
							))}
						</ul>
					)}
				</AdminSection>
			) : null}

			{/* Backups List */}
			<DatabaseMigrationsSection />

			<AdminSection title={m.admin_database_available_snapshots()} description={m.admin_database_retention_notice()}>
				{backupsContent}
			</AdminSection>
		</div>
	);
}
