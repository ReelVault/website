import type { MediaFileWithRelation } from "@reelvault/sdk";
import { Link } from "@tanstack/react-router";
import { Clock, Download, FileVideo, FolderOpen, HardDrive, Layers, Monitor, Play, RefreshCw, Subtitles, Volume2 } from "lucide-react";
import { Suspense, startTransition, useState } from "react";
import { useCurrentUser } from "@/client/hooks/use-current-profile";
import { useRefreshMediaFile } from "@/client/hooks/use-media";
import { isAdminUser } from "@/components/auth/admin-access";
import { CopyIcon } from "@/components/copy-icon";
import { LazyOfflineDownloadDialog, LazyReassignMediaFileDialog } from "@/components/lazy-dialogs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";
import { useCopyToClipboard } from "@/utils/clipboard-utils";
import { formatDuration } from "@/utils/duration-utils";
import { formatFileSize } from "@/utils/file-utils";
import { formatAudioChannels, formatBitrate } from "@/utils/format-utils";
import { formatLanguage } from "./media-file-utils";

interface MediaFileCardProps {
	file: MediaFileWithRelation;
	metadataId?: string;
}

export function MediaFileCard({ file, metadataId }: MediaFileCardProps) {
	const { hasCopied: copied, copy } = useCopyToClipboard();
	const [showDownloadDialog, setShowDownloadDialog] = useState(false);
	const [showReassignDialog, setShowReassignDialog] = useState(false);
	const { user } = useCurrentUser();
	const { refreshMediaFile, refreshingMediaFileId } = useRefreshMediaFile(metadataId);

	const isMovie = file.library.type === "movies";

	const handleCopyPath = () => {
		// startTransition consumes the async work without a floating promise chain.
		startTransition(async () => {
			await copy(file.filePath, m.components_media_file_path_word());
		});
	};

	const isRefreshing = refreshingMediaFileId === file.id;

	const handleOpenDownloadDialog = () => setShowDownloadDialog(true);
	const handleOpenReassignDialog = () => setShowReassignDialog(true);
	const handleRefresh = () => refreshMediaFile(file.id);

	return (
		<div className="border-border/80 bg-card hover:border-primary/40 flex flex-col gap-4 rounded-xl border p-5 shadow-xs transition-colors">
			{/* FILE HEADER */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex min-w-0 flex-1 items-start gap-3.5">
					<div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl shadow-xs">
						<FileVideo className="size-5" />
					</div>
					<div className="flex min-w-0 flex-1 flex-col gap-1.5">
						<div className="flex flex-wrap items-center gap-2">
							<h4 className="text-foreground text-base font-bold tracking-tight">
								{file.edition ?? (file.qualityTag ? m.web_episode_version_version({ qualityTag: file.qualityTag }) : file.fileName)}
							</h4>
							{file.qualityTag !== null && <Badge size="sm">{file.qualityTag}</Badge>}
							{file.isDefault && (
								<Badge variant="secondary" size="sm">
									{m.admin_users_default()}
								</Badge>
							)}
							{file.source !== null && (
								<Badge variant="outline" size="sm" font="mono">
									{file.source}
								</Badge>
							)}
							{file.formatName !== null && (
								<Badge variant="outline" size="sm" font="mono">
									{file.formatName}
								</Badge>
							)}
						</div>
						<p className="text-muted-foreground/90 truncate font-mono text-xs">{file.fileName}</p>
					</div>
				</div>

				<div className="flex shrink-0 items-center gap-2">
					<Button variant="outline" size="sm" onClick={handleOpenDownloadDialog} title={m.components_offline_download_title()}>
						<Download className="text-primary size-3.5" />
						<span className="hidden sm:inline">{m.components_offline_download_short()}</span>
					</Button>
					{isAdminUser(user) && (
						<>
							<Button
								variant="outline"
								size="icon"
								onClick={handleOpenReassignDialog}
								aria-label={m.components_media_file_change_metadata_assignment()}
								title={m.components_media_file_change_metadata_assignment()}
							>
								<Layers className="text-primary size-4" />
							</Button>
							<Button
								variant="outline"
								size="icon"
								disabled={isRefreshing}
								onClick={handleRefresh}
								aria-label={m.components_media_file_refresh_ffprobe()}
								title={m.components_media_file_refresh_ffprobe()}
							>
								<RefreshCw className={isRefreshing ? "animate-spin" : undefined} />
							</Button>
						</>
					)}
					<Button nativeButton={false} render={<Link to="/player/$id" params={{ id: file.id }} />}>
						<Play data-icon="inline-start" className="size-4 fill-current" aria-hidden="true" />
						{m.components_metadata_card_play()}
					</Button>
				</div>
			</div>

			{showDownloadDialog && (
				<Suspense fallback={null}>
					<LazyOfflineDownloadDialog
						open={showDownloadDialog}
						onOpenChange={setShowDownloadDialog}
						mediaFileId={file.id}
						title={file.edition ? `${file.fileName} (${file.edition})` : file.fileName}
						fileName={file.fileName}
					/>
				</Suspense>
			)}

			{showReassignDialog && (
				<Suspense fallback={null}>
					<LazyReassignMediaFileDialog
						open={showReassignDialog}
						onOpenChange={setShowReassignDialog}
						mediaFileId={file.id}
						fileName={file.fileName}
						mediaType={isMovie ? "movie" : "tv_show"}
					/>
				</Suspense>
			)}

			{/* PODSTAWOWE METRYKI */}
			<div className="border-border/60 bg-muted/40 grid grid-cols-2 gap-3 rounded-xl border p-3.5 sm:grid-cols-4">
				<div className="flex items-center gap-2.5">
					<Clock className="text-primary size-4 shrink-0" />
					<div className="flex flex-col">
						<span className="text-muted-foreground text-xs font-semibold">{m.components_duration_label()}</span>
						<span className="text-foreground text-sm font-bold">
							{file.duration ? formatDuration(file.duration) : m.common_not_available()}
						</span>
					</div>
				</div>

				<div className="flex items-center gap-2.5">
					<HardDrive className="text-primary size-4 shrink-0" />
					<div className="flex flex-col">
						<span className="text-muted-foreground text-xs font-semibold">{m.components_file_size_label()}</span>
						<span className="text-foreground text-sm font-bold">
							{file.size != null && file.size > 0 ? formatFileSize(file.size) : m.common_not_available()}
						</span>
					</div>
				</div>

				<div className="flex items-center gap-2.5">
					<Layers className="text-primary size-4 shrink-0" />
					<div className="flex flex-col">
						<span className="text-muted-foreground text-xs font-semibold">{m.components_media_file_total_bitrate()}</span>
						<span className="text-foreground text-sm font-bold">
							{file.bitRate ? formatBitrate(file.bitRate) : m.common_not_available()}
						</span>
					</div>
				</div>

				<div className="flex min-w-0 items-center gap-2.5">
					<FolderOpen className="text-primary size-4 shrink-0" />
					<div className="flex min-w-0 flex-col">
						<span className="text-muted-foreground text-xs font-semibold">{m.components_library_label()}</span>
						<span className="text-foreground truncate text-sm font-bold">{file.library.name}</span>
					</div>
				</div>
			</div>

			{/* FILE PATH */}
			<div className="flex flex-col gap-1.5">
				<span className="text-muted-foreground text-xs font-semibold">{m.components_media_file_disk_path()}</span>
				<div className="border-border/70 bg-background flex items-center justify-between gap-3 rounded-lg border p-3">
					<span className="text-foreground/90 flex-1 font-mono text-xs break-all select-all" title={file.filePath}>
						{file.filePath}
					</span>
					<Button variant="outline" size="xs" onClick={handleCopyPath} className="shrink-0">
						<CopyIcon copied={copied} className="size-3" />
						<span>{copied ? m.common_copied() : m.common_copy()}</span>
					</Button>
				</div>
			</div>

			{/* STRUMIENIE WIDEO */}
			{file.videoStreams.length > 0 && (
				<div className="flex flex-col gap-2">
					<div className="text-foreground flex items-center gap-2 text-xs font-bold">
						<Monitor className="text-primary size-4" />
						<span>{m.components_media_file_video_stream({ videoCount: file.videoStreams.length })}</span>
					</div>
					<div className="flex flex-col gap-2">
						{file.videoStreams.map((vStream) => (
							<div
								key={`${vStream.mediaFileId}-v-${vStream.index}`}
								className="border-border/60 bg-background/80 flex flex-wrap items-center gap-3 rounded-lg border p-3 text-xs"
							>
								<Badge weight="bold" variant="default" size="sm" font="mono" transform="uppercase">
									{vStream.codecName}
								</Badge>
								{vStream.profile !== null && <span className="text-foreground font-medium">{vStream.profile}</span>}
								<div className="border-border/40 bg-muted/60 text-foreground flex items-center gap-1 rounded border px-2 py-0.5 font-mono font-bold">
									<span>{m.components_media_file_resolution({ width: vStream.width, height: vStream.height })}</span>
								</div>
								{vStream.frameRate !== null && (
									<span className="text-muted-foreground font-medium">
										{m.components_media_file_frame_rate({ rate: vStream.frameRate })}
									</span>
								)}
								{vStream.pixelFormat !== null && (
									<Badge variant="outline" size="sm" font="mono">
										{vStream.pixelFormat}
									</Badge>
								)}
								{vStream.bitRate !== null && <span className="text-foreground font-semibold">{formatBitrate(vStream.bitRate)}</span>}
							</div>
						))}
					</div>
				</div>
			)}

			{/* STRUMIENIE AUDIO */}
			{file.audioStreams.length > 0 && (
				<div className="flex flex-col gap-2">
					<div className="text-foreground flex items-center gap-2 text-xs font-bold">
						<Volume2 className="text-primary size-4" />
						<span>{m.components_media_file_audio_tracks({ audioCount: file.audioStreams.length })}</span>
					</div>
					<div className="flex flex-col gap-2">
						{file.audioStreams.map((aStream) => (
							<div
								key={`${aStream.mediaFileId}-a-${aStream.index}`}
								className="border-border/60 bg-background/80 flex flex-wrap items-center gap-3 rounded-lg border p-3 text-xs"
							>
								<Badge weight="semibold" variant="secondary" size="sm">
									{formatLanguage(aStream.language)}
								</Badge>
								<span className="text-foreground font-mono font-bold uppercase">{aStream.codecName}</span>
								<span className="text-foreground font-semibold">{formatAudioChannels(aStream.channels, aStream.channelLayout)}</span>
								{aStream.title !== null && (
									<span className="text-muted-foreground italic">{m.components_media_quoted_label({ label: aStream.title })}</span>
								)}
								{aStream.bitRate !== null && <span className="text-muted-foreground">{formatBitrate(aStream.bitRate)}</span>}
								{aStream.sampleRate !== null && (
									<span className="text-muted-foreground">
										{m.components_media_file_sample_rate({ rate: Math.round(aStream.sampleRate / 1000) })}
									</span>
								)}
								{aStream.isDefault && (
									<Badge variant="outline" size="sm">
										{m.common_default_word()}
									</Badge>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			{/* NAPISY */}
			{file.subtitles.length > 0 && (
				<div className="flex flex-col gap-2">
					<div className="text-foreground flex items-center gap-2 text-xs font-bold">
						<Subtitles className="text-primary size-4" />
						<span>{m.admin_media_subtitle_tracks_count_title({ count: file.subtitles.length })}</span>
					</div>
					<div className="flex flex-wrap gap-2">
						{file.subtitles.map((sub) => (
							<div key={sub.id} className="border-border/60 bg-background/80 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs">
								<Badge weight="semibold" variant="outline" size="sm">
									{formatLanguage(sub.language)}
								</Badge>
								<span className="text-foreground font-mono text-xs font-bold">{sub.format}</span>
								{sub.label !== null && (
									<span className="text-muted-foreground max-w-44 truncate italic">
										{m.components_media_quoted_label({ label: sub.label })}
									</span>
								)}
								{sub.type === "external" ? (
									<Badge variant="secondary" size="sm">
										{m.admin_subtitles_external_word()}
									</Badge>
								) : (
									<Badge variant="outline" size="sm">
										{m.components_built_in()}
									</Badge>
								)}
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
