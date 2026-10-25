import { FolderTree, HardDrive, Video } from "lucide-react";
import { m } from "@/paraglide/messages";
import { formatFileSize } from "@/utils/file-utils";

interface LibraryCardMetricsProps {
	mediaCount: number;
	totalSize: number;
	pathsCount: number;
}

export function LibraryCardMetrics({ mediaCount, totalSize, pathsCount }: LibraryCardMetricsProps) {
	return (
		<div className="border-border/60 bg-muted/25 grid grid-cols-3 gap-2.5 rounded-lg border p-3">
			<div className="flex flex-col gap-1">
				<div className="text-muted-foreground flex items-center gap-1.5 text-xs">
					<Video className="text-primary size-3.5" />
					<span>{m.admin_libraries_items()}</span>
				</div>
				<span className="text-foreground text-base font-semibold tabular-nums">{mediaCount}</span>
			</div>

			<div className="border-border/60 flex flex-col gap-1 border-l pl-3">
				<div className="text-muted-foreground flex items-center gap-1.5 text-xs">
					<HardDrive className="text-primary size-3.5" />
					<span>{m.admin_resources_memory()}</span>
				</div>
				<span className="text-foreground text-base font-semibold tabular-nums">{formatFileSize(totalSize)}</span>
			</div>

			<div className="border-border/60 flex flex-col gap-1 border-l pl-3">
				<div className="text-muted-foreground flex items-center gap-1.5 text-xs">
					<FolderTree className="text-primary size-3.5" />
					<span>{m.admin_libraries_folders()}</span>
				</div>
				<span className="text-foreground text-base font-semibold tabular-nums">{pathsCount}</span>
			</div>
		</div>
	);
}
