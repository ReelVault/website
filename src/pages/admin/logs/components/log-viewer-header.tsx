import type { AdminLogFileInfo } from "@reelvault/sdk";
import { Activity, Maximize2, Minimize2, Trash2 } from "lucide-react";
import { ConfirmAction } from "@/components/confirm-action";
import { CopyIcon } from "@/components/copy-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardHeader } from "@/components/ui/card";
import { m } from "@/paraglide/messages";

interface LogViewerHeaderProps {
	activeFile?: AdminLogFileInfo;
	effectiveFileId: string;
	viewMode: "formatted" | "raw";
	hasCopied: boolean;
	totalEntries: number;
	isFullscreen: boolean;
	isDeleting: boolean;
	onCopyRaw: () => void;
	onDeleteFile: (fileId: string) => void;
	onToggleFullscreen: () => void;
}

export function LogViewerHeader({
	activeFile,
	effectiveFileId,
	viewMode,
	hasCopied,
	totalEntries,
	isFullscreen,
	isDeleting,
	onCopyRaw,
	onDeleteFile,
	onToggleFullscreen,
}: LogViewerHeaderProps) {
	const handleConfirmDelete = () => {
		onDeleteFile(effectiveFileId);
	};

	return (
		<CardHeader className="flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex min-w-0 items-center gap-2">
				<Activity className="size-4 shrink-0 text-muted-foreground" />
				<span className="truncate font-medium font-mono text-xs sm:max-w-md">{activeFile?.name ?? "reelvault.log"}</span>
			</div>
			<div className="flex items-center justify-between gap-2 sm:justify-end">
				{viewMode === "raw" && (
					<Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={onCopyRaw}>
						<CopyIcon copied={hasCopied} />
						{hasCopied ? m.admin_logs_copied() : m.common_copy()}
					</Button>
				)}
				<ConfirmAction
					trigger={
						<Button
							variant="ghost"
							size="icon-sm"
							className="size-7 text-muted-foreground hover:text-destructive"
							title={m.admin_logs_delete_this_log_file()}
							disabled={isDeleting}
						>
							<Trash2 className="size-3.5" />
						</Button>
					}
					title={m.admin_logs_delete_active_confirm()}
					description={m.admin_logs_delete_named_confirm({ fileName: activeFile?.name ?? effectiveFileId })}
					confirmLabel={m.admin_logs_delete_file()}
					onConfirm={handleConfirmDelete}
				/>
				<Badge variant="outline" className="text-[11px] tabular-nums">
					{m.admin_logs_entries_count({ count: totalEntries })}
				</Badge>
				<Button
					variant="ghost"
					size="icon-sm"
					className="size-7"
					onClick={onToggleFullscreen}
					title={isFullscreen ? m.admin_logs_close_fullscreen() : m.admin_logs_fullscreen()}
				>
					{isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
				</Button>
			</div>
		</CardHeader>
	);
}
