import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { Clock, FileVideo, HardDrive, Layers, Play, RefreshCw } from "lucide-react";
import { useRefreshMediaFile } from "@/client/hooks/use-media";
import { useDetailsView } from "@/client/hooks/use-metadata-queries";
import { AppErrorState } from "@/components/app-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuGroup,
	ContextMenuItem,
	ContextMenuLabel,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { detach } from "@/lib/detach";
import { getVersionLabel } from "@/pages/player/utils/player-utils";
import { m } from "@/paraglide/messages";
import { formatDuration } from "@/utils/duration-utils";
import { formatFileSize } from "@/utils/file-utils";
import { formatBitrate } from "@/utils/format-utils";
import { DetailsSection } from "../components/details-section";

export function DetailsFiles({ metadataId, isAdmin }: { metadataId: string; isAdmin?: boolean }) {
	// Files and progress come from the details-view composite — no separate queries.
	const { data: view, error, refetch: refetchDetailsView } = useDetailsView(metadataId);
	const playback = view?.userState.progress ?? undefined;
	const { refreshMediaFile, refreshingMediaFileId } = useRefreshMediaFile(metadataId);

	if (view === undefined) {
		return (
			<DetailsSection title={m.web_available_video_versions()} icon={FileVideo}>
				<AppErrorState
					title={m.web_versions_fetch_failed()}
					description={m.web_check_connection()}
					error={error}
					onRetry={() => detach(refetchDetailsView())}
				/>
			</DetailsSection>
		);
	}

	const files = view.mediaFiles;
	if (files.length <= 1) return null;

	return (
		<DetailsSection title={m.web_available_video_versions()} icon={FileVideo}>
			<div className="flex flex-col gap-3">
				{files.map((file, index) => {
					const versionTitle = getVersionLabel(file.edition, file.qualityTag, index);

					// Server returns per-file playback status (fileProgress) — index by file id.
					const progress = playback?.fileProgress[file.id];
					const progressPercent = progress?.progress?.duration
						? Math.round((progress.progress.position / progress.progress.duration) * 100)
						: 0;

					return (
						<ContextMenu key={file.id}>
							<ContextMenuTrigger render={<Card variant="interactive" />} className="group relative">
								<CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
									{/* Left side: resolution icon + title and tags */}
									<div className="flex items-start gap-3.5 sm:items-center">
										<div className="border-border/55 bg-background flex size-11 shrink-0 items-center justify-center rounded-lg border shadow-xs">
											<FileVideo className="text-primary size-5" />
										</div>
										<div className="flex flex-col gap-1">
											<div className="flex flex-wrap items-center gap-2">
												<h4 className="text-foreground text-base font-semibold tracking-tight">{versionTitle}</h4>
												{file.qualityTag && <Badge size="sm">{file.qualityTag}</Badge>}
												{progress?.status === "watched" && <Badge variant="success">{m.common_watched_badge()}</Badge>}
												{progress?.status === "in_progress" && (
													<Badge variant="primary">{m.common_percent_value({ value: progressPercent })}</Badge>
												)}
												{file.source && (
													<Badge tone="muted" variant="outline">
														{file.source}
													</Badge>
												)}
											</div>
											{progress?.status === "in_progress" && (
												<div className="bg-muted mt-2 h-1 overflow-hidden rounded-full">
													<div className="bg-primary h-full" style={{ width: `${progressPercent}%` }} />
												</div>
											)}

											{/* Inline parameters (time, size, bitrate, format) */}
											<div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
												{file.duration && (
													<div className="flex items-center gap-1.5">
														<Clock className="text-muted-foreground/75 size-3.5" />
														<span>{formatDuration(file.duration)}</span>
													</div>
												)}
												{file.size != null && file.size > 0 && (
													<div className="flex items-center gap-1.5">
														<HardDrive className="text-muted-foreground/75 size-3.5" />
														<span>{formatFileSize(file.size)}</span>
													</div>
												)}
												{file.bitRate && (
													<div className="flex items-center gap-1.5">
														<Layers className="text-muted-foreground/75 size-3.5" />
														<span>{formatBitrate(file.bitRate)}</span>
													</div>
												)}
												{file.formatName && (
													<span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-xs">{file.formatName}</span>
												)}
											</div>
										</div>
									</div>

									{/* Right side: actions */}
									<div className="flex items-center justify-end pt-2 sm:pt-0">
										{isAdmin && (
											<Button
												variant="outline"
												size="icon"
												className="mr-2"
												disabled={refreshingMediaFileId === file.id}
												onClick={() => refreshMediaFile(file.id)}
												aria-label={m.web_refresh_file_info_named({ version: versionTitle })}
												title={m.web_refresh_file_info()}
											>
												<RefreshCw className={cn("size-3.5", refreshingMediaFileId === file.id && "animate-spin")} />
											</Button>
										)}
										<Link to="/player/$id" params={{ id: file.id }} className="w-full sm:w-auto">
											<Button className="w-full sm:w-auto">
												<Play className="size-3 transition-transform group-hover:scale-110" />
												{m.components_metadata_card_play()}
											</Button>
										</Link>
									</div>
								</CardContent>
							</ContextMenuTrigger>
							<ContextMenuContent>
								<ContextMenuGroup>
									<ContextMenuLabel>{versionTitle}</ContextMenuLabel>
								</ContextMenuGroup>
								<ContextMenuItem render={<Link to="/player/$id" params={{ id: file.id }} />}>
									{m.components_metadata_card_play()}
								</ContextMenuItem>
								{isAdmin && (
									<>
										<ContextMenuSeparator />
										<ContextMenuItem disabled={refreshingMediaFileId === file.id} onClick={() => refreshMediaFile(file.id)}>
											{m.web_refresh_file_info()}
										</ContextMenuItem>
									</>
								)}
							</ContextMenuContent>
						</ContextMenu>
					);
				})}
			</div>
		</DetailsSection>
	);
}
