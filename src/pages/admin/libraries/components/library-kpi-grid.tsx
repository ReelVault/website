import type { LibraryWithRelations } from "@reelvault/sdk";
import { FolderOpen, FolderTree, HardDrive, Video } from "lucide-react";
import { AdminStat } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { formatFileSize } from "@/utils/file-utils";
import { formatNumber } from "@/utils/format-utils";

interface LibraryKpiGridProps {
	libraries: LibraryWithRelations[];
	total: number;
}

export function LibraryKpiGrid({ libraries, total }: LibraryKpiGridProps) {
	let totalMedia = 0;
	let totalSize = 0;
	let totalPaths = 0;

	for (const lib of libraries) {
		totalPaths += lib.paths.length;
		totalMedia += lib.totalMediaFiles ?? lib.mediaFileCount ?? 0;
		totalSize += lib.totalSize ?? 0;
	}

	return (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
			<AdminStat label={m.admin_libraries_kpi_libraries()} value={`${total}`} icon={FolderOpen} />
			<AdminStat label={m.admin_libraries_kpi_indexed_media()} value={formatNumber(totalMedia)} icon={Video} />
			<AdminStat label={m.admin_libraries_storage()} value={formatFileSize(totalSize)} icon={HardDrive} />
			<AdminStat label={m.admin_libraries_source_directories()} value={`${totalPaths}`} icon={FolderTree} />
		</div>
	);
}
