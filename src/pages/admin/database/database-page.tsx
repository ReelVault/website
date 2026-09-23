import { cn } from "cn";
import { Database, Plus, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { useAdminBackups } from "@/client/hooks/use-admin-backups";
import { AppEmptyState, AppErrorState } from "@/components/app-states";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { detach } from "@/lib/detach";
import { AdminPageHeader, AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { DatabaseBackupCard } from "./components/database-backup-card";
import { DatabaseStatsGrid } from "./components/database-stats-grid";

const SKELETON_KEYS = ["1", "2", "3"] as const;

export default function AdminDatabasePage() {
	const { backupsQuery, backups, createBackupMutation, deleteBackupMutation } = useAdminBackups();

	const handleRefetch = () => {
		detach(backupsQuery.refetch());
	};

	const handleCreateBackup = async () => {
		if (createBackupMutation.isPending) return;

		const backup = await createBackupMutation.mutateAsync();
		toast.success(m.admin_database_backup_created({ fileName: backup.fileName }));
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
					<Skeleton key={key} className="h-16 rounded-xl" />
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
					/>
				))}
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6 pb-10">
			<AdminPageHeader
				icon={Database}
				eyebrow={m.admin_database_engine_security()}
				title={m.admin_database_heading()}
				count={backups.length}
				description={m.admin_database_snapshots_description()}
				actions={
					<div className="flex flex-wrap items-center gap-2">
						<Button variant="outline" size="sm" onClick={handleRefetch} disabled={backupsQuery.isFetching} className="gap-1.5 text-xs">
							<RefreshCw className={cn("size-3.5", { "animate-spin": backupsQuery.isFetching })} />
							{m.common_refresh()}
						</Button>
						<Button
							size="sm"
							onClick={() => {
								detach(handleCreateBackup());
							}}
							disabled={createBackupMutation.isPending}
							className="gap-1.5 text-xs"
						>
							{createBackupMutation.isPending ? <RefreshCw className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
							{m.admin_database_create_backup()}
						</Button>
					</div>
				}
			/>

			{/* Info Cards */}
			<DatabaseStatsGrid backups={backups} />

			{/* Backups List */}
			<AdminSection title={m.admin_database_available_snapshots()} description={m.admin_database_retention_notice()}>
				{backupsContent}
			</AdminSection>
		</div>
	);
}
