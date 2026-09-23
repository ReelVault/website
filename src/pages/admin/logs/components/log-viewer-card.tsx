import type { AdminLogFileInfo } from "@reelvault/sdk";
import { cn } from "cn";
import { Server } from "lucide-react";
import type { ReactNode } from "react";
import type { useAdminLogs } from "@/client/hooks/use-admin-logs";
import { AppEmptyState, AppErrorState } from "@/components/app-states";
import { SimplePagination } from "@/components/simple-pagination";
import { Card, CardContent } from "@/components/ui/card";
import { SkeletonList } from "@/components/ui/skeleton";
import { m } from "@/paraglide/messages";
import { LogFormattedViewer } from "./log-formatted-viewer";
import { LogRawViewer } from "./log-raw-viewer";
import { LogViewerHeader } from "./log-viewer-header";

type LogsResult = ReturnType<typeof useAdminLogs>;

interface LogViewerCardProps {
	activeFile?: AdminLogFileInfo;
	effectiveFileId: string;
	viewMode: "formatted" | "raw";
	hasCopied: boolean;
	totalEntries: number;
	isFullscreen: boolean;
	isDeleting: boolean;
	isLoading: boolean;
	error: LogsResult["error"];
	logs: LogsResult["logs"];
	page: number;
	totalPages: number;
	onCopyRaw: () => void;
	onDeleteFile: (fileId: string) => void;
	onToggleFullscreen: () => void;
	onRefetchLogs: () => void;
	onPageChange: (page: number) => void;
}

export function LogViewerCard({
	activeFile,
	effectiveFileId,
	viewMode,
	hasCopied,
	totalEntries,
	isFullscreen,
	isDeleting,
	isLoading,
	error,
	logs,
	page,
	totalPages,
	onCopyRaw,
	onDeleteFile,
	onToggleFullscreen,
	onRefetchLogs,
	onPageChange,
}: LogViewerCardProps) {
	let cardContent: ReactNode;
	if (isLoading) {
		cardContent = (
			<div className="flex flex-col gap-1 p-4">
				<SkeletonList count={8} itemClassName="h-10" />
			</div>
		);
	} else if (error) {
		cardContent = <AppErrorState title={m.admin_logs_fetch_error()} error={error} onRetry={onRefetchLogs} />;
	} else if (logs.length === 0) {
		cardContent = <AppEmptyState icon={Server} title={m.admin_logs_no_entries()} description={m.admin_logs_no_matching_lines()} />;
	} else if (viewMode === "raw") {
		cardContent = <LogRawViewer logs={logs} page={page} />;
	} else {
		cardContent = <LogFormattedViewer logs={logs} />;
	}

	return (
		<Card
			className={cn("flex flex-col", isFullscreen ? "flex-1 overflow-hidden" : "h-[70svh] min-h-0 lg:h-[calc(100vh-16rem)] lg:min-h-125")}
		>
			<LogViewerHeader
				activeFile={activeFile}
				effectiveFileId={effectiveFileId}
				viewMode={viewMode}
				hasCopied={hasCopied}
				totalEntries={totalEntries}
				isFullscreen={isFullscreen}
				isDeleting={isDeleting}
				onCopyRaw={onCopyRaw}
				onDeleteFile={onDeleteFile}
				onToggleFullscreen={onToggleFullscreen}
			/>

			<CardContent className="flex-1 overflow-hidden p-0">{cardContent}</CardContent>

			<SimplePagination variant="admin" currentPage={page} totalPages={totalPages} isLoading={isLoading} onPageChange={onPageChange} />
		</Card>
	);
}
