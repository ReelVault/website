import { Link } from "@tanstack/react-router";
import {
	Check,
	Clock,
	Copy,
	Download,
	FileVideo,
	FolderOpen,
	HardDrive,
	Layers,
	Monitor,
	Play,
	RefreshCw,
	Subtitles,
	Volume2,
} from "lucide-react";
import { Suspense, startTransition, useState } from "react";
import type { MediaFileWithRelation } from "@reelvault/sdk";
import { useCurrentUser } from "@/client/hooks/use-current-profile";
import { useRefreshMediaFile } from "@/client/hooks/use-media";
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
		<div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-card p-5 shadow-xs transition-colors hover:border-primary/40">
			{/* FILE HEADER */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex min-w-0 flex-1 items-start gap-3.5">
					<div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs">
						<FileVideo className="size-5" />
					</div>
					<div className="flex min-w-0 flex-1 flex-col gap-1.5">
						<div className="flex flex-wrap items-center gap-2">
							<h4 className="font-bold text-base text-foreground tracking-tight">
								{file.edition ?? (file.qualityTag ? m.web_episode_version_version({ qualityTag: file.qualityTag }) : file.fileName)}
							</h4>
							{file.qualityTag !== null && <Badge size="sm">{file.qualityTag}</Badge>}
							{file.isDefault && (
								<Badge variant="secondary" size="sm">
									{m.admin_users_default()}
								</Badge>
							)}
							{file.source !== null && (
								<Badge variant="outline" size="sm" className="font-mono text-[10px] uppercase">
									{file.source}
								</Badge>
							)}
							{file.formatName !== null && (
								<Badge variant="outline" size="sm" className="font-mono text-[10px] uppercase">
									{file.formatName}
								</Badge>
							)}
						</div>
						<p className="truncate font-mono text-muted-foreground/90 text-xs">{file.fileName}</p>
					</div>
				</div>

				<div className="flex shrink-0 items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={handleOpenDownloadDialog}
						className="gap-1.5 font-medium text-xs"
						title={m.components_offline_download_title()}
					>
						<Download className="size-3.5 text-primary" />
						<span className="hidden sm:inline">{m.components_offline_download_short()}</span>
					</Button>
					{user?.role === "admin" && (
						<>
							<Button
								variant="outline"
								size="icon"
								onClick={handleOpenReassignDialog}
								aria-label={m.components_media_file_change_metadata_assignment()}
								title={m.components_media_file_change_metadata_assignment()}
							>
								<Layers className="size-4 text-primary" />
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
					<Button nativeButton={false} render={<Link to="/player/$id" params={{ id: file.id }} />} className="gap-2 font-medium">
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
			<div className="grid grid-cols-2 gap-3 rounded-xl border border-border/60 bg-muted/40 p-3.5 sm:grid-cols-4">
				<div className="flex items-center gap-2.5">
					<Clock className="size-4 shrink-0 text-primary" />
					<div className="flex flex-col">
						<span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
							{m.components_duration_label()}
						</span>
						<span className="font-bold text-foreground text-sm">
							{file.duration ? formatDuration(file.duration) : m.common_not_available()}
						</span>
					</div>
				</div>

				<div className="flex items-center gap-2.5">
					<HardDrive className="size-4 shrink-0 text-primary" />
					<div className="flex flex-col">
						<span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
							{m.components_file_size_label()}
						</span>
						<span className="font-bold text-foreground text-sm">
							{file.size != null && file.size > 0 ? formatFileSize(file.size) : m.common_not_available()}
						</span>
					</div>
				</div>

				<div className="flex items-center gap-2.5">
					<Layers className="size-4 shrink-0 text-primary" />
					<div className="flex flex-col">
						<span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
							{m.components_media_file_total_bitrate()}
						</span>
						<span className="font-bold text-foreground text-sm">
							{file.bitRate ? formatBitrate(file.bitRate) : m.common_not_available()}
						</span>
					</div>
				</div>

				<div className="flex min-w-0 items-center gap-2.5">
					<FolderOpen className="size-4 shrink-0 text-primary" />
					<div className="flex min-w-0 flex-col">
						<span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">{m.components_library_label()}</span>
						<span className="truncate font-bold text-foreground text-sm">{file.library.name}</span>
					</div>
				</div>
			</div>

			{/* FILE PATH */}
			<div className="flex flex-col gap-1.5">
				<span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
					{m.components_media_file_disk_path()}
				</span>
				<div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-background p-3">
					<span className="flex-1 select-all break-all font-mono text-foreground/90 text-xs" title={file.filePath}>
						{file.filePath}
					</span>
					<Button variant="outline" size="xs" onClick={handleCopyPath} className="shrink-0 gap-1.5 font-medium text-xs">
						{copied ? <Check className="size-3 text-success" /> : <Copy className="size-3" />}
						<span>{copied ? m.common_copied() : m.common_copy()}</span>
					</Button>
				</div>
			</div>

			{/* STRUMIENIE WIDEO */}
			{file.videoStreams.length > 0 && (
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-2 font-bold text-foreground text-xs uppercase tracking-wider">
						<Monitor className="size-4 text-primary" />
						<span>{m.components_media_file_video_stream({ videoCount: file.videoStreams.length })}</span>
					</div>
					<div className="flex flex-col gap-2">
						{file.videoStreams.map((vStream) => (
							<div
								key={`${vStream.mediaFileId}-v-${vStream.index}`}
								className="flex flex-wrap items-center gap-3 rounded-lg border border-border/60 bg-background/80 p-3 text-xs"
							>
								<Badge variant="default" size="sm" className="font-bold font-mono uppercase">
									{vStream.codecName}
								</Badge>
								{vStream.profile !== null && <span className="font-medium text-foreground">{vStream.profile}</span>}
								<div className="flex items-center gap-1 rounded border border-border/40 bg-muted/60 px-2 py-0.5 font-bold font-mono text-foreground">
									<span>{m.components_media_file_resolution({ width: vStream.width, height: vStream.height })}</span>
								</div>
								{vStream.frameRate !== null && (
									<span className="font-medium text-muted-foreground">
										{m.components_media_file_frame_rate({ rate: vStream.frameRate })}
									</span>
								)}
								{vStream.pixelFormat !== null && (
									<Badge variant="outline" size="sm" className="font-mono text-[10px]">
										{vStream.pixelFormat}
									</Badge>
								)}
								{vStream.bitRate !== null && <span className="font-semibold text-foreground">{formatBitrate(vStream.bitRate)}</span>}
							</div>
						))}
					</div>
				</div>
			)}

			{/* STRUMIENIE AUDIO */}
			{file.audioStreams.length > 0 && (
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-2 font-bold text-foreground text-xs uppercase tracking-wider">
						<Volume2 className="size-4 text-primary" />
						<span>{m.components_media_file_audio_tracks({ audioCount: file.audioStreams.length })}</span>
					</div>
					<div className="flex flex-col gap-2">
						{file.audioStreams.map((aStream) => (
							<div
								key={`${aStream.mediaFileId}-a-${aStream.index}`}
								className="flex flex-wrap items-center gap-3 rounded-lg border border-border/60 bg-background/80 p-3 text-xs"
							>
								<Badge variant="secondary" size="sm" className="font-semibold">
									{formatLanguage(aStream.language)}
								</Badge>
								<span className="font-bold font-mono text-foreground uppercase">{aStream.codecName}</span>
								<span className="font-semibold text-foreground">{formatAudioChannels(aStream.channels, aStream.channelLayout)}</span>
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
									<Badge variant="outline" size="sm" className="text-[10px]">
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
					<div className="flex items-center gap-2 font-bold text-foreground text-xs uppercase tracking-wider">
						<Subtitles className="size-4 text-primary" />
						<span>{m.admin_media_subtitle_tracks_count_title({ count: file.subtitles.length })}</span>
					</div>
					<div className="flex flex-wrap gap-2">
						{file.subtitles.map((sub) => (
							<div key={sub.id} className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/80 px-3 py-2 text-xs">
								<Badge variant="outline" size="sm" className="font-semibold">
									{formatLanguage(sub.language)}
								</Badge>
								<span className="font-bold font-mono text-foreground text-xs uppercase">{sub.format}</span>
								{sub.label !== null && (
									<span className="max-w-44 truncate text-muted-foreground italic">
										{m.components_media_quoted_label({ label: sub.label })}
									</span>
								)}
								{sub.type === "external" ? (
									<Badge variant="secondary" size="sm" className="text-[10px]">
										{m.admin_subtitles_external_word()}
									</Badge>
								) : (
									<Badge variant="outline" size="sm" className="text-[10px]">
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
