import { cn } from "cn";
import { Download, RefreshCw, Terminal, Trash2 } from "lucide-react";
import { ConfirmAction } from "@/components/confirm-action";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
import { AdminPageHeader } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { LogFilesSidebar } from "./components/log-files-sidebar";
import { LogMobileFileSelect } from "./components/log-mobile-file-select";
import { LogViewerCard } from "./components/log-viewer-card";
import { LogViewerControls } from "./components/log-viewer-controls";
import { useLogsPageController } from "./hooks/use-logs-page-controller";

export default function AdminLogsPage() {
	const c = useLogsPageController();

	return (
		<div className="flex flex-col gap-6">
			{c.isFullscreen && <div className="fixed inset-0 z-40 bg-black/80" />}

			<AdminPageHeader
				icon={Terminal}
				eyebrow={m.admin_logs_diagnostics_eyebrow()}
				title={m.admin_logs_heading()}
				description={m.admin_logs_description()}
				actions={
					<div className="flex items-center gap-2">
						<StatusBadge status={c.autoRefresh ? "success" : "idle"} label={c.autoRefresh ? m.admin_logs_live() : m.admin_logs_paused()} />
						<Button variant={c.autoRefresh ? "default" : "outline"} size="sm" onClick={() => c.setAutoRefresh((prev) => !prev)}>
							{c.autoRefresh ? m.admin_logs_pause() : m.admin_logs_enable_live()}
						</Button>
						<Button
							variant="outline"
							size="sm"
							disabled={c.isFetching}
							onClick={() => {
								detach(() => c.refetch());
								detach(() => c.refetchFiles());
							}}
						>
							<RefreshCw className={cn("size-4", c.isFetching && "animate-spin")} />
							{m.common_refresh()}
						</Button>
						<Button variant="outline" size="sm" onClick={c.handleDownload}>
							<Download className="size-4" />
							{m.admin_logs_download()}
						</Button>
						<ConfirmAction
							trigger={
								<Button variant="outline" size="sm" disabled={c.isCleaningUp}>
									<Trash2 className="size-4" />
									{m.admin_logs_cleanup_action()}
								</Button>
							}
							title={m.admin_logs_cleanup_confirm_title()}
							description={m.admin_logs_cleanup_confirm_description()}
							confirmLabel={m.admin_logs_cleanup_confirm_action()}
							onConfirm={() => c.cleanupLogs()}
						/>
					</div>
				}
			/>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
				<LogMobileFileSelect
					effectiveFileId={c.effectiveFileId}
					filteredFiles={c.filteredFiles}
					isLoadingFiles={c.isLoadingFiles}
					isFullscreen={c.isFullscreen}
					onSelectFile={(id) => {
						c.setSelectedFileId(id);
						c.setPage(1);
					}}
					onRefetchFiles={() => detach(() => c.refetchFiles())}
				/>

				<LogFilesSidebar
					files={c.files}
					filteredFiles={c.filteredFiles}
					effectiveFileId={c.effectiveFileId}
					fileTypeFilter={c.fileTypeFilter}
					isLoadingFiles={c.isLoadingFiles}
					isFullscreen={c.isFullscreen}
					onSelectFile={(id) => {
						c.setSelectedFileId(id);
						c.setPage(1);
					}}
					onFilterChange={(value) => c.handleFilterChange(value)}
					onRefetchFiles={() => detach(() => c.refetchFiles())}
					onDeleteFile={(id) => detach(() => c.handleDeleteFile(id))}
				/>

				<div
					className={cn(
						"flex flex-col gap-4 lg:col-span-8",
						c.isFullscreen && "fixed inset-4 z-50 flex h-[calc(100vh-2rem)] flex-col gap-3 rounded-2xl border bg-background p-4 shadow-2xl",
					)}
				>
					<LogViewerControls
						searchQuery={c.searchQuery}
						onSearchChange={(value) => {
							c.setSearchQuery(value);
							c.setPage(1);
						}}
						viewMode={c.viewMode}
						onViewModeChange={c.setViewMode}
						selectedLevel={c.selectedLevel}
						onLevelChange={(lvl) => {
							c.setSelectedLevel(lvl);
							c.setPage(1);
						}}
					/>

					<LogViewerCard
						activeFile={c.activeFile}
						effectiveFileId={c.effectiveFileId}
						viewMode={c.viewMode}
						hasCopied={c.hasCopied}
						totalEntries={c.pagination.total}
						isFullscreen={c.isFullscreen}
						isDeleting={c.isDeleting}
						isLoading={c.isLoading}
						error={c.error}
						logs={c.logs}
						page={c.page}
						totalPages={c.pagination.totalPages}
						onCopyRaw={() => detach(() => c.handleCopyRaw())}
						onDeleteFile={(id) => detach(() => c.handleDeleteFile(id))}
						onToggleFullscreen={() => c.setIsFullscreen((prev) => !prev)}
						onRefetchLogs={() => detach(() => c.refetch())}
						onPageChange={c.setPage}
					/>
				</div>
			</div>
		</div>
	);
}
