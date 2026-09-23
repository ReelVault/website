import { Database, HardDrive, ShieldCheck } from "lucide-react";
import type { useAdminBackups } from "@/client/hooks/use-admin-backups";
import { AdminStatCard } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { formatFileSize } from "@/utils/file-utils";

type BackupItem = ReturnType<typeof useAdminBackups>["backups"][number];

interface DatabaseStatsGridProps {
	backups: BackupItem[];
}

export function DatabaseStatsGrid({ backups }: DatabaseStatsGridProps) {
	const totalSize = backups.reduce((acc, b) => acc + b.sizeBytes, 0);

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
			<AdminStatCard
				label={m.admin_database_copies_count()}
				value={backups.length}
				icon={Database}
				description={m.admin_database_sqlite_snapshots()}
			/>
			<AdminStatCard
				label={m.admin_database_space_used()}
				value={formatFileSize(totalSize)}
				icon={HardDrive}
				description={m.admin_database_total_archive_size()}
			/>
			<AdminStatCard
				label={m.admin_database_engine_label()}
				value="SQLite WAL"
				icon={ShieldCheck}
				tone="success"
				description={m.admin_database_concurrent_writes()}
			/>
		</div>
	);
}
