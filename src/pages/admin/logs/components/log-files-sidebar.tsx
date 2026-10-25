import type { AdminLogFileInfo } from "@reelvault/sdk";
import { cn } from "cn";
import { HardDrive, RefreshCw } from "lucide-react";
import type { MouseEvent, ReactNode } from "react";
import { useState } from "react";
import { getReelVaultApiUrl } from "@/client/client";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SkeletonList } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AdminSearch } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { LogFileItem } from "./log-file-item";

interface LogFilesSidebarProps {
	files: AdminLogFileInfo[];
	filteredFiles: AdminLogFileInfo[];
	effectiveFileId: string;
	fileTypeFilter: string;
	isLoadingFiles: boolean;
	isFullscreen: boolean;
	onSelectFile: (fileId: string) => void;
	onFilterChange: (filter: string) => void;
	onRefetchFiles: () => void;
	onDeleteFile: (fileId: string) => void;
}

const handleDownloadFile = (event: MouseEvent<HTMLElement>) => {
	const fileId = event.currentTarget.dataset.fileId;
	if (!fileId) return;

	const url = `${getReelVaultApiUrl()}/v1/admin/logs/download?fileId=${encodeURIComponent(fileId)}`;
	window.open(url, "_blank", "noopener,noreferrer");
};

export function LogFilesSidebar({
	files,
	filteredFiles,
	effectiveFileId,
	fileTypeFilter,
	isLoadingFiles,
	isFullscreen,
	onSelectFile,
	onFilterChange,
	onRefetchFiles,
	onDeleteFile,
}: LogFilesSidebarProps) {
	const handleFilterChange = (value: string[]) => {
		if (value[0]) onFilterChange(value[0]);
	};
	const handleSelectFile = (event: MouseEvent<HTMLButtonElement>) => {
		const fileId = event.currentTarget.dataset.fileId;
		if (fileId) onSelectFile(fileId);
	};
	const [fileQuery, setFileQuery] = useState("");
	const searchedFiles = fileQuery.trim()
		? filteredFiles.filter((file) => file.name.toLowerCase().includes(fileQuery.trim().toLowerCase()))
		: filteredFiles;

	// Deleting a log file removes it from disk for good, so the menu item only asks; the dialog deletes.
	const [pendingDelete, setPendingDelete] = useState<AdminLogFileInfo | null>(null);
	const handleDeleteFile = (event: MouseEvent<HTMLElement>) => {
		const fileId = event.currentTarget.dataset.fileId;
		setPendingDelete(filteredFiles.find((file) => file.id === fileId) ?? null);
	};
	const confirmDelete = () => {
		if (pendingDelete) onDeleteFile(pendingDelete.id);
		setPendingDelete(null);
	};

	let filesContent: ReactNode;
	if (isLoadingFiles) {
		filesContent = (
			<div className="flex flex-col gap-2 p-2">
				<SkeletonList count={7} itemClassName="h-14" />
			</div>
		);
	} else if (searchedFiles.length === 0) {
		filesContent = (
			<div className="text-muted-foreground flex h-48 flex-col items-center justify-center text-center text-xs">
				<HardDrive className="mb-2 size-8 opacity-40" />
				{m.admin_logs_no_files_category()}
			</div>
		);
	} else {
		filesContent = (
			<LogFileList
				filteredFiles={searchedFiles}
				effectiveFileId={effectiveFileId}
				onSelect={handleSelectFile}
				onDelete={handleDeleteFile}
			/>
		);
	}

	return (
		<div className={cn("hidden flex-col gap-4 lg:col-span-4 lg:flex", isFullscreen && "lg:hidden")}>
			<Card className="flex h-[calc(100vh-16rem)] min-h-125 flex-col">
				<CardHeader className="flex flex-col gap-3">
					<div className="flex items-center justify-between">
						<CardTitle>{m.admin_logs_journal_files_count({ filtered: filteredFiles.length, total: files.length })}</CardTitle>
						<Button variant="ghost" size="icon-sm" onClick={onRefetchFiles} aria-label={m.admin_logs_refresh_journal_files()}>
							<RefreshCw className="size-3.5" aria-hidden="true" />
						</Button>
					</div>
					<AdminSearch value={fileQuery} onChange={setFileQuery} placeholder={m.admin_logs_search_files()} className="w-full" />
					<ToggleGroup
						multiple={false}
						value={[fileTypeFilter]}
						onValueChange={handleFilterChange}
						variant="outline"
						size="sm"
						className="w-full justify-start"
					>
						<ToggleGroupItem value="all" size="sm" className="flex-1">
							{m.common_all()}
						</ToggleGroupItem>
						<ToggleGroupItem value="server" size="sm" className="flex-1">
							{m.common_server()}
						</ToggleGroupItem>
						<ToggleGroupItem value="ffmpeg" size="sm" className="flex-1">
							{m.admin_logs_ffmpeg_label()}
						</ToggleGroupItem>
					</ToggleGroup>
				</CardHeader>
				<CardContent className="flex-1 overflow-hidden">{filesContent}</CardContent>
			</Card>
			<AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{m.admin_logs_delete_file_confirm({ name: pendingDelete?.name ?? "" })}</AlertDialogTitle>
						<AlertDialogDescription>{m.admin_logs_delete_file_warning()}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{m.common_cancel()}</AlertDialogCancel>
						<AlertDialogAction variant="destructive" onClick={confirmDelete}>
							{m.admin_logs_delete_file()}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

interface LogFileListProps {
	filteredFiles: AdminLogFileInfo[];
	effectiveFileId: string;
	onSelect: (event: MouseEvent<HTMLButtonElement>) => void;
	onDelete: (event: MouseEvent<HTMLElement>) => void;
}

function LogFileList({ filteredFiles, effectiveFileId, onSelect, onDelete }: LogFileListProps) {
	return (
		<ScrollArea className="h-full pr-2">
			<div className="flex flex-col gap-1">
				{filteredFiles.map((file) => (
					<LogFileItem
						key={file.id}
						file={file}
						isSelected={effectiveFileId === file.id}
						onSelect={onSelect}
						onDelete={onDelete}
						onDownload={handleDownloadFile}
					/>
				))}
			</div>
		</ScrollArea>
	);
}
