import { cn } from "cn";
import { RefreshCw } from "lucide-react";
import type { AdminLogFileInfo } from "reelvault-sdk";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { m } from "@/paraglide/messages";
import { formatFileSize } from "@/utils/file-utils";

interface LogMobileFileSelectProps {
	effectiveFileId: string;
	filteredFiles: AdminLogFileInfo[];
	isLoadingFiles: boolean;
	isFullscreen: boolean;
	onSelectFile: (fileId: string) => void;
	onRefetchFiles: () => void;
}

export function LogMobileFileSelect({
	effectiveFileId,
	filteredFiles,
	isLoadingFiles,
	isFullscreen,
	onSelectFile,
	onRefetchFiles,
}: LogMobileFileSelectProps) {
	return (
		<div className={cn("flex items-center gap-2 lg:hidden", isFullscreen && "hidden")}>
			<Select
				value={effectiveFileId}
				onValueChange={(id) => {
					if (id) onSelectFile(id);
				}}
			>
				<SelectTrigger className="w-full" aria-label={m.admin_logs_journal_file()}>
					<SelectValue placeholder={isLoadingFiles ? m.admin_logs_loading_files() : m.common_select_file()} />
				</SelectTrigger>
				<SelectContent>
					{filteredFiles.map((file) => (
						<SelectItem key={file.id} value={file.id} className="font-mono text-xs">
							{file.name} {m.common_dot_separator()} {formatFileSize(file.size)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<Button
				variant="outline"
				size="icon"
				className="size-10 shrink-0 sm:size-9"
				onClick={onRefetchFiles}
				aria-label={m.admin_logs_refresh_journal_files()}
			>
				<RefreshCw className={cn("size-4", isLoadingFiles && "animate-spin")} />
			</Button>
		</div>
	);
}
