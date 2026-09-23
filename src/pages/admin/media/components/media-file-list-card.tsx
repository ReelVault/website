import { Link } from "@tanstack/react-router";
import { AudioLines, Clock, FileVideo, HardDrive, Pencil, Play, Subtitles, Trash2 } from "lucide-react";
import { Suspense, useState } from "react";
import type { MediaFileWithRelation } from "@reelvault/sdk";
import { ConfirmAction } from "@/components/confirm-action";
import { LazyReassignMediaFileDialog } from "@/components/lazy-dialogs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import { m } from "@/paraglide/messages";
import { formatDuration } from "@/utils/duration-utils";
import { formatFileSize } from "@/utils/file-utils";
import { MediaFileListContextMenu } from "./media-file-list-context-menu";

interface MediaFileListCardProps {
	file: MediaFileWithRelation;
	isDeleting: boolean;
	onDelete: (id: string, fileName: string) => Promise<unknown>;
}

export function MediaFileListCard({ file, isDeleting, onDelete }: MediaFileListCardProps) {
	const [isReassignDialogOpen, setIsReassignDialogOpen] = useState(false);
	const isMovie = file.library.type === "movies";

	return (
		<>
			<ContextMenu>
				<ContextMenuTrigger className="group flex flex-col gap-3 rounded-xl border border-border/80 bg-card p-4 shadow-2xs transition-[border-color,background-color,color,box-shadow] duration-150 hover:border-primary/40 hover:shadow-sm">
					<div className="flex items-start justify-between gap-3">
						<div className="flex min-w-0 items-center gap-3">
							<div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-muted/40 text-primary shadow-2xs">
								<FileVideo className="size-5" />
							</div>
							<div className="min-w-0">
								<p className="truncate font-semibold text-foreground text-sm tracking-tight">{file.fileName}</p>
								<p className="mt-0.5 truncate font-mono text-muted-foreground text-xs">{file.filePath}</p>
							</div>
						</div>

						<div className="flex shrink-0 items-center gap-1 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
							<Button
								variant="ghost"
								size="icon"
								className="size-8"
								nativeButton={false}
								render={<Link to="/player/$id" params={{ id: file.id }} target="_blank" />}
								title={m.admin_metadata_open_in_player()}
								aria-label={m.admin_media_open_in_player_named({ fileName: file.fileName })}
							>
								<Play className="size-3.5 text-muted-foreground" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="size-8"
								nativeButton={false}
								render={<Link to="/admin/media/$id" params={{ id: file.id }} />}
								title={m.admin_media_edit_file()}
								aria-label={m.admin_media_edit_file_named({ fileName: file.fileName })}
							>
								<Pencil className="size-3.5 text-muted-foreground" />
							</Button>
							<ConfirmAction
								trigger={
									<Button
										variant="ghost"
										size="icon"
										className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
										disabled={isDeleting}
										title={m.admin_logs_delete_file()}
										aria-label={m.admin_media_delete_file_named({ fileName: file.fileName })}
									>
										<Trash2 className="size-3.5" />
									</Button>
								}
								title={m.admin_media_delete_entry_confirm()}
								description={m.admin_media_entry_detach_notice_full({ fileName: file.fileName })}
								confirmLabel={m.admin_logs_delete_file()}
								onConfirm={() => onDelete(file.id, file.fileName)}
							/>
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-1.5">
						{file.library.name && (
							<Badge variant="outline" size="sm" className="font-normal text-[10px]">
								{file.library.name}
							</Badge>
						)}
						{file.qualityTag && (
							<Badge variant="secondary" size="sm" className="font-mono text-xs">
								{file.qualityTag}
							</Badge>
						)}
						{file.source && (
							<Badge variant="outline" size="sm" className="font-mono text-[11px] uppercase">
								{file.source}
							</Badge>
						)}
						{file.formatName && (
							<span className="rounded-md border border-border/70 bg-muted/20 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
								{file.formatName}
							</span>
						)}
						{file.isDefault && (
							<Badge variant="default" size="sm" className="text-[10px]">
								{m.common_default_badge()}
							</Badge>
						)}
					</div>

					<div className="flex items-center justify-between border-border/50 border-t pt-3 font-mono text-muted-foreground text-xs">
						<div className="flex items-center gap-3">
							{file.size !== null && file.size > 0 ? (
								<span className="flex items-center gap-1">
									<HardDrive className="size-3 text-primary" />
									<span className="tabular-nums">{formatFileSize(file.size)}</span>
								</span>
							) : null}
							<span className="flex items-center gap-1">
								<Clock className="size-3" />
								<span className="tabular-nums">{formatDuration(file.duration)}</span>
							</span>
						</div>

						<div className="flex items-center gap-2">
							{file.audioStreams.length > 0 && (
								<span
									className="flex items-center gap-1 text-[11px]"
									title={m.admin_media_audio_tracks_count_title({ count: file.audioStreams.length })}
								>
									<AudioLines className="size-3 text-primary" />
									<span>{file.audioStreams.length}</span>
								</span>
							)}
							{file.subtitles.length > 0 && (
								<span
									className="flex items-center gap-1 text-[11px]"
									title={m.admin_media_subtitle_tracks_count_title({ count: file.subtitles.length })}
								>
									<Subtitles className="size-3 text-primary" />
									<span>{file.subtitles.length}</span>
								</span>
							)}
						</div>
					</div>
				</ContextMenuTrigger>

				<MediaFileListContextMenu
					file={file}
					isDeleting={isDeleting}
					onDelete={onDelete}
					onOpenReassign={() => setIsReassignDialogOpen(true)}
				/>
			</ContextMenu>

			{isReassignDialogOpen && (
				<Suspense fallback={null}>
					<LazyReassignMediaFileDialog
						open={isReassignDialogOpen}
						onOpenChange={setIsReassignDialogOpen}
						mediaFileId={file.id}
						fileName={file.fileName}
						mediaType={isMovie ? "movie" : "tv_show"}
					/>
				</Suspense>
			)}
		</>
	);
}
