import { cn } from "cn";
import { FolderOpen, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import type { LibraryWithRelations } from "reelvault-sdk";
import { AsyncButton } from "@/components/async-button";
import { ConfirmAction } from "@/components/confirm-action";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { copyToClipboard } from "@/utils/clipboard-utils";
import { formatDateTime, formatTimeAgo } from "@/utils/format-utils";
import { LibraryCardContextMenu } from "./library-card-context-menu";
import { LibraryCardHeader } from "./library-card-header";
import { LibraryCardMetrics } from "./library-card-metrics";
import { LibraryPathRow } from "./library-path-row";

const handleCopyId = (text: string, label: string) => {
	detach(copyToClipboard(text, label));
};

export function LibraryCard({
	lib,
	isScanning,
	scanningPathIds,
	isDeleting,
	onScan,
	onPathScan,
	onDelete,
	onEdit,
	onCheckErrors,
	onShowIgnoredAssets,
	onShowScanFindings,
}: {
	lib: LibraryWithRelations;
	isScanning: boolean;
	scanningPathIds: Set<string>;
	isDeleting: boolean;
	onScan: (id: string) => void;
	onPathScan: (libraryId: string, pathId: string) => void;
	onDelete: (id: string, name: string) => Promise<unknown>;
	onEdit: (lib: LibraryWithRelations) => void;
	onCheckErrors: (libraryPaths: string[]) => void;
	onShowIgnoredAssets: (libraryId: string) => void;
	onShowScanFindings: (libraryId: string) => void;
}) {
	const paths = lib.paths;
	const [pathsExpanded, setPathsExpanded] = useState(true);
	const totalSize = lib.totalSize ?? 0;
	const mediaCount = lib.totalMediaFiles ?? lib.mediaFileCount ?? 0;

	return (
		<ContextMenu>
			<ContextMenuTrigger
				render={
					<Card
						className={cn(
							"group relative flex flex-col justify-between overflow-hidden border-border/80 bg-card transition-[border-color,background-color,color,box-shadow] duration-200 hover:border-primary/40 hover:shadow-md",
							isScanning && "border-primary/50 shadow-[0_0_20px_color-mix(in_oklab,var(--primary)_30%,transparent)]",
						)}
					/>
				}
			>
				<div>
					{/* Header */}
					<LibraryCardHeader
						lib={lib}
						onScan={onScan}
						onEdit={onEdit}
						onDelete={onDelete}
						onCheckErrors={onCheckErrors}
						onShowIgnoredAssets={onShowIgnoredAssets}
						onShowScanFindings={onShowScanFindings}
					/>

					<CardContent className="flex flex-col gap-5 p-5 pt-0">
						{/* Micro-metrics bar */}
						<LibraryCardMetrics mediaCount={mediaCount} totalSize={totalSize} pathsCount={paths.length} />

						{/* Paths section */}
						<Collapsible open={pathsExpanded} onOpenChange={setPathsExpanded} className="flex flex-col gap-2.5">
							<div className="flex items-center justify-between">
								<CollapsibleTrigger
									render={
										<button
											type="button"
											className="flex items-center gap-2 font-medium text-muted-foreground text-xs transition-colors hover:text-foreground"
										/>
									}
								>
									<FolderOpen className="size-3.5 text-primary" />
									<span>{m.admin_libraries_source_directories_count({ pathsCount: paths.length })}</span>
								</CollapsibleTrigger>
							</div>

							<CollapsibleContent className="flex flex-col gap-2">
								{paths.length > 0 ? (
									paths.map((path) => (
										<LibraryPathRow
											key={path.id}
											libraryId={lib.id}
											path={path}
											lib={lib}
											isPathScanning={isScanning || scanningPathIds.has(path.id)}
											onPathScan={onPathScan}
										/>
									))
								) : (
									<div className="rounded-lg border border-border/80 border-dashed p-4 text-center">
										<p className="text-muted-foreground text-xs">{m.admin_libraries_no_paths()}</p>
										<Button variant="ghost" size="sm" className="mt-1.5 h-7 text-primary text-xs" onClick={() => onEdit(lib)}>
											{m.admin_libraries_add_path()}
										</Button>
									</div>
								)}
							</CollapsibleContent>
						</Collapsible>
					</CardContent>

					{/* Timestamps Row */}
					<div className="flex flex-wrap items-center justify-between gap-2 border-border/50 border-t bg-muted/5 px-5 py-2 font-mono text-[11px] text-muted-foreground">
						<span>{m.common_created_at_value({ date: formatDateTime(lib.createdAt) })}</span>
						<span>{m.admin_libraries_updated_at({ date: formatTimeAgo(lib.updatedAt) })}</span>
					</div>
				</div>

				{/* Card Footer */}
				<div className="flex items-center gap-2.5 border-border/60 border-t bg-muted/10 p-4">
					<AsyncButton
						variant="default"
						size="default"
						className="h-9 flex-1 gap-2 font-medium text-sm shadow-xs"
						onClick={() => onScan(lib.id)}
						isPending={isScanning}
						pendingLabel={m.admin_libraries_scanning()}
					>
						<RefreshCw className="size-3.5" />
						<span>{m.admin_libraries_scan_library()}</span>
					</AsyncButton>

					<ConfirmAction
						trigger={
							<Button
								variant="outline"
								size="icon"
								className="size-9 shrink-0 text-destructive hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
								disabled={isDeleting}
								title={m.admin_libraries_delete_library()}
								aria-label={m.admin_libraries_delete_named({ name: lib.name })}
							>
								<Trash2 className="size-4" />
							</Button>
						}
						title={m.admin_libraries_delete_confirm({ name: lib.name })}
						description={m.admin_libraries_detach_warning()}
						confirmLabel={m.admin_libraries_delete_library()}
						onConfirm={() => onDelete(lib.id, lib.name)}
					/>
				</div>
			</ContextMenuTrigger>

			{/* Context Menu */}
			<LibraryCardContextMenu
				lib={lib}
				onScan={onScan}
				onEdit={onEdit}
				onDelete={onDelete}
				onCheckErrors={onCheckErrors}
				onShowIgnoredAssets={onShowIgnoredAssets}
				onShowScanFindings={onShowScanFindings}
				onCopyId={handleCopyId}
			/>
		</ContextMenu>
	);
}
