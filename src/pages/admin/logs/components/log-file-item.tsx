import { cn } from "cn";
import { Download, Trash2 } from "lucide-react";
import { createElement, type MouseEvent } from "react";
import type { AdminLogFileInfo } from "@reelvault/sdk";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu";
import { m } from "@/paraglide/messages";
import { formatFileSize } from "@/utils/file-utils";
import { formatLogDate, getLogIcon } from "./log-file-utils";

interface LogFileItemProps {
	file: AdminLogFileInfo;
	isSelected: boolean;
	onSelect: (event: MouseEvent<HTMLButtonElement>) => void;
	onDelete: (event: MouseEvent<HTMLElement>) => void;
	onDownload: (event: MouseEvent<HTMLElement>) => void;
}

export function LogFileItem({ file, isSelected, onSelect, onDelete, onDownload }: LogFileItemProps) {
	const icon = createElement(getLogIcon(file), {
		className: cn("size-4 shrink-0", isSelected ? "text-primary-foreground" : "text-muted-foreground"),
	});

	return (
		<ContextMenu>
			<ContextMenuTrigger
				render={
					<button
						type="button"
						onClick={onSelect}
						data-file-id={file.id}
						className={cn(
							"group flex w-full flex-col gap-1 rounded-lg p-2.5 text-left transition-[border-color,background-color,color,box-shadow]",
							isSelected ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground hover:bg-muted/60",
						)}
					/>
				}
			>
				<div className="flex items-center gap-2">
					{icon}
					<span className="truncate font-medium font-mono text-xs leading-tight">{file.name}</span>
				</div>
				<div
					className={cn(
						"flex items-center justify-between text-[11px] tabular-nums",
						isSelected ? "text-primary-foreground/80" : "text-muted-foreground",
					)}
				>
					<span>{formatLogDate(file.modifiedAt)}</span>
					<span>{formatFileSize(file.size)}</span>
				</div>
			</ContextMenuTrigger>
			<ContextMenuContent className="w-48">
				<ContextMenuItem onClick={onDownload} data-file-id={file.id}>
					<Download className="mr-2 size-4" />
					{m.downloads_download_file()}
				</ContextMenuItem>
				<ContextMenuSeparator />
				<ContextMenuItem variant="destructive" onClick={onDelete} data-file-id={file.id}>
					<Trash2 className="mr-2 size-4" />
					{m.admin_logs_delete_file()}
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}
