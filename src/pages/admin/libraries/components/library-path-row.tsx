import type { LibraryWithRelations } from "@reelvault/sdk";
import { RefreshCw } from "lucide-react";
import { AsyncButton } from "@/components/async-button";
import { CopyIcon } from "@/components/copy-icon";
import { Badge } from "@/components/ui/badge";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { useCopyToClipboard } from "@/utils/clipboard-utils";
import { formatFileSize } from "@/utils/file-utils";
import { formatStorageMode, getPathStats } from "./library-card-utils";

interface LibraryPathRowProps {
	libraryId: string;
	path: LibraryWithRelations["paths"][number];
	lib: LibraryWithRelations;
	isPathScanning: boolean;
	onPathScan: (libraryId: string, pathId: string) => void;
}

export function LibraryPathRow({ libraryId, path, lib, isPathScanning, onPathScan }: LibraryPathRowProps) {
	const { hasCopied: isCopied, copy: copyPath } = useCopyToClipboard();
	const { hasCopied: isKeyCopied, copy: copyStableKey } = useCopyToClipboard();
	const stats = getPathStats(lib, path);
	const pathMode = formatStorageMode(path.metadataStorageMode);

	return (
		<div className="flex flex-col gap-2 rounded-lg border border-border/70 bg-muted/20 p-3 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between">
			<div className="min-w-0 flex-1">
				<div className="flex flex-wrap items-center gap-2">
					<p className="truncate font-medium font-mono text-foreground text-xs sm:text-[13px]" title={path.path}>
						{path.path}
					</p>
					<button
						type="button"
						onClick={() => detach(copyPath(path.path, m.components_media_file_path_word()))}
						className="-m-2 inline-flex size-10 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:m-0 sm:size-6"
						title={m.admin_libraries_copy_path()}
						aria-label={m.admin_libraries_copy_path_named({ path: path.path })}
					>
						<CopyIcon copied={isCopied} className="size-3" />
					</button>

					{!path.isActive && (
						<Badge variant="warning-outline" size="sm">
							{m.common_inactive()}
						</Badge>
					)}
				</div>

				<div className="mt-1 flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
					<span className="font-medium text-foreground/90 tabular-nums">{m.common_files_count({ count: stats.count })}</span>
					<span>{m.common_dot_separator()}</span>
					<span className="tabular-nums">{formatFileSize(stats.size)}</span>
					{pathMode && (
						<>
							<span>{m.common_dot_separator()}</span>
							<Badge variant="outline" size="sm">
								{pathMode}
							</Badge>
						</>
					)}
					{path.stableKey && (
						<>
							<span>{m.common_dot_separator()}</span>
							<span className="flex items-center gap-1 font-mono text-muted-foreground/80 text-xs">
								<span>{m.admin_libraries_stable_key_preview({ key: path.stableKey.slice(0, 12) })}</span>
								<button
									type="button"
									onClick={() => detach(copyStableKey(path.stableKey, m.admin_libraries_stable_path_key()))}
									className="text-muted-foreground hover:text-foreground"
									title={m.admin_libraries_copy_stable_key()}
								>
									<CopyIcon copied={isKeyCopied} className="size-2.5" />
								</button>
							</span>
						</>
					)}
				</div>
			</div>

			<AsyncButton
				variant="outline"
				size="sm"
				className="h-10 shrink-0 gap-1.5 self-start px-2.5 text-xs sm:h-7 sm:self-center"
				onClick={() => onPathScan(libraryId, path.id)}
				isPending={isPathScanning}
				pendingLabel={m.common_scanning()}
			>
				<RefreshCw className="size-3" />
				<span>{m.common_scan()}</span>
			</AsyncButton>
		</div>
	);
}
