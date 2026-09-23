import { Link } from "@tanstack/react-router";
import { ArrowLeft, Clapperboard, Clock, FileVideo, HardDrive, Layers, RefreshCw, Save, ShieldCheck, Tv } from "lucide-react";
import { Suspense, useState } from "react";
import type { MediaFileWithRelation } from "@reelvault/sdk";
import { AsyncButton } from "@/components/async-button";
import { LazyReassignMediaFileDialog } from "@/components/lazy-dialogs";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { m } from "@/paraglide/messages";
import { formatFileSize } from "@/utils/file-utils";
import { MediaFileScanDialog } from "./media-file-scan-dialog";

interface MediaFileHeaderProps {
	file: MediaFileWithRelation;
	mediaFileId: string;
	isRefreshing: boolean;
	isUpdating: boolean;
	refreshStatus?: string;
	onRefresh: () => void;
	onSave: () => void;
}

export function MediaFileHeader({ file, mediaFileId, isRefreshing, isUpdating, refreshStatus, onRefresh, onSave }: MediaFileHeaderProps) {
	const isMovie = file.library.type === "movies";
	const [isScanDialogOpen, setIsScanDialogOpen] = useState(false);
	const [isReassignDialogOpen, setIsReassignDialogOpen] = useState(false);

	return (
		<Card className="rounded-2xl border-border/80 bg-card/60 p-6">
			<div className="flex flex-col gap-4">
				<div className="flex items-center gap-2 text-muted-foreground text-xs">
					<Link to="/admin/media" className="flex items-center gap-1 hover:text-foreground">
						<ArrowLeft className="size-3.5" />
						<span>{m.admin_nav_media_files()}</span>
					</Link>
					<span>{m.common_breadcrumb_separator()}</span>
					<span className="font-mono">{m.common_truncated_id({ id: mediaFileId.slice(0, 8) })}</span>
				</div>

				<div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
					<div className="flex flex-col gap-1.5">
						<div className="flex flex-wrap items-center gap-2">
							<h1 className="font-bold text-2xl text-foreground tracking-tight">{file.fileName}</h1>
							<Badge variant={isMovie ? "default" : "secondary"} className="gap-1 text-xs">
								{isMovie ? <Clapperboard className="size-3" /> : <Tv className="size-3" />}
								{isMovie ? m.plugins_movie_word() : m.admin_media_episode_of_series()}
							</Badge>
							{file.qualityTag && <Badge variant="outline">{file.qualityTag}</Badge>}
							{file.edition && <Badge variant="secondary">{file.edition}</Badge>}
						</div>
						<div className="flex flex-wrap items-center gap-4 text-muted-foreground text-xs">
							{file.size !== null && file.size > 0 && (
								<span className="flex items-center gap-1 font-mono">
									<HardDrive className="size-3.5" />
									{formatFileSize(file.size)}
								</span>
							)}
							{file.duration && (
								<span className="flex items-center gap-1 font-mono">
									<Clock className="size-3.5" />
									{m.admin_media_duration_minutes({ minutes: Math.floor(file.duration / 60) })}
								</span>
							)}
							{file.formatName && (
								<span className="flex items-center gap-1 font-mono">
									<FileVideo className="size-3.5" />
									{file.formatName}
								</span>
							)}
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-2 self-start pt-1">
						<Button variant="outline" size="default" onClick={() => setIsReassignDialogOpen(true)} className="gap-2 shadow-xs">
							<Layers className="size-4 text-primary" />
							<span>{m.components_media_file_change_metadata_assignment()}</span>
						</Button>

						<Button variant="outline" size="default" onClick={() => setIsScanDialogOpen(true)} className="gap-2 shadow-xs">
							<ShieldCheck className="size-4 text-success" />
							<span>{m.admin_media_scan_file()}</span>
						</Button>

						<AsyncButton
							variant="outline"
							size="default"
							isPending={isRefreshing}
							pendingLabel={m.admin_media_refreshing()}
							onClick={onRefresh}
							className="gap-2 shadow-xs"
						>
							<RefreshCw className="size-4" />
							<span>{m.admin_media_refresh_disk_data()}</span>
						</AsyncButton>

						<AsyncButton
							variant="default"
							size="default"
							isPending={isUpdating}
							pendingLabel={m.common_saving_dots()}
							onClick={onSave}
							className="gap-2 font-medium shadow-xs"
						>
							<Save className="size-4" />
							<span>{m.common_save_changes()}</span>
						</AsyncButton>
					</div>
				</div>

				{(refreshStatus === "pending" || refreshStatus === "running") && (
					<div
						className="mt-4 flex flex-wrap items-center gap-2.5 rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs"
						aria-live="polite"
					>
						<StatusBadge status={refreshStatus === "pending" ? "pending" : "running"} label={m.admin_media_worker_in_progress()} />
						<span className="text-muted-foreground">{m.admin_media_reading_streams_notice()}</span>
						<Button
							variant="ghost"
							size="sm"
							className="h-6 text-primary text-xs"
							nativeButton={false}
							render={<Link to="/admin/worker" />}
						>
							{m.admin_media_show_in_worker()}
						</Button>
					</div>
				)}
			</div>

			<MediaFileScanDialog open={isScanDialogOpen} onOpenChange={setIsScanDialogOpen} mediaFileId={mediaFileId} fileName={file.fileName} />
			{isReassignDialogOpen && (
				<Suspense fallback={null}>
					<LazyReassignMediaFileDialog
						open={isReassignDialogOpen}
						onOpenChange={setIsReassignDialogOpen}
						mediaFileId={mediaFileId}
						fileName={file.fileName}
						mediaType={isMovie ? "movie" : "tv_show"}
					/>
				</Suspense>
			)}
		</Card>
	);
}
