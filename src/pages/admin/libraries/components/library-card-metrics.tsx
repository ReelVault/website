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
		<div className="grid grid-cols-3 gap-2.5 rounded-lg border border-border/60 bg-muted/25 p-3">
			<div className="flex flex-col gap-1">
				<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
					<Video className="size-3.5 text-primary" />
					<span>{m.admin_libraries_items()}</span>
				</div>
				<span className="font-semibold text-base text-foreground tabular-nums">{mediaCount}</span>
			</div>

			<div className="flex flex-col gap-1 border-border/60 border-l pl-3">
				<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
					<HardDrive className="size-3.5 text-primary" />
					<span>{m.admin_resources_memory()}</span>
				</div>
				<span className="font-semibold text-base text-foreground tabular-nums">{formatFileSize(totalSize)}</span>
			</div>

			<div className="flex flex-col gap-1 border-border/60 border-l pl-3">
				<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
					<FolderTree className="size-3.5 text-primary" />
					<span>{m.admin_libraries_folders()}</span>
				</div>
				<span className="font-semibold text-base text-foreground tabular-nums">{pathsCount}</span>
			</div>
		</div>
	);
}
