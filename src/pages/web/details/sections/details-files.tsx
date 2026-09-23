import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { Clock, FileVideo, HardDrive, Layers, Play, RefreshCw } from "lucide-react";
import { useRefreshMediaFile } from "@/client/hooks/use-media";
import { useDetailsView } from "@/client/hooks/use-metadata-queries";
import { AppErrorState } from "@/components/app-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
					let versionTitle: string;
					if (file.edition) {
						versionTitle = file.edition;
					} else if (file.qualityTag) {
						versionTitle = m.web_episode_version_version({ qualityTag: file.qualityTag });
					} else {
						versionTitle = m.web_episode_release_number({ number: index + 1 });
					}

					// Server returns per-file playback status (fileProgress) — index by file id.
					const progress = playback?.fileProgress[file.id];
					const progressPercent = progress?.progress?.duration
						? Math.round((progress.progress.position / progress.progress.duration) * 100)
						: 0;

					return (
						<ContextMenu key={file.id}>
							<ContextMenuTrigger className="group relative flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-4 transition-[background-color,border-color,box-shadow] duration-200 hover:border-primary/40 hover:bg-muted/30 hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
								{/* Left side: resolution icon + title and tags */}
								<div className="flex items-start gap-3.5 sm:items-center">
									<div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-border/55 bg-background shadow-xs">
										<FileVideo className="size-5 text-primary" />
									</div>
									<div className="flex flex-col gap-1">
										<div className="flex flex-wrap items-center gap-2">
											<h4 className="font-semibold text-base text-foreground tracking-tight">{versionTitle}</h4>
											{file.qualityTag && <Badge size="sm">{file.qualityTag}</Badge>}
											{progress?.status === "watched" && <Badge className="bg-success/10 text-success">{m.common_watched_badge()}</Badge>}
											{progress?.status === "in_progress" && (
												<Badge className="bg-primary/10 text-primary">{m.common_percent_value({ value: progressPercent })}</Badge>
											)}
											{file.source && (
												<Badge variant="outline" className="text-[10px] text-muted-foreground uppercase">
													{file.source}
												</Badge>
											)}
										</div>
										{progress?.status === "in_progress" && (
											<div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
												<div className="h-full bg-primary" style={{ width: `${progressPercent}%` }} />
											</div>
										)}

										{/* Inline parameters (time, size, bitrate, format) */}
										<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-xs">
											{file.duration && (
												<div className="flex items-center gap-1.5">
													<Clock className="size-3.5 text-muted-foreground/75" />
													<span>{formatDuration(file.duration)}</span>
												</div>
											)}
											{file.size != null && file.size > 0 && (
												<div className="flex items-center gap-1.5">
													<HardDrive className="size-3.5 text-muted-foreground/75" />
													<span>{formatFileSize(file.size)}</span>
												</div>
											)}
											{file.bitRate && (
												<div className="flex items-center gap-1.5">
													<Layers className="size-3.5 text-muted-foreground/75" />
													<span>{formatBitrate(file.bitRate)}</span>
												</div>
											)}
											{file.formatName && (
												<span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground uppercase">
													{file.formatName}
												</span>
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
											className="mr-2 size-10 sm:size-8"
											disabled={refreshingMediaFileId === file.id}
											onClick={() => refreshMediaFile(file.id)}
											aria-label={m.web_refresh_file_info_named({ version: versionTitle })}
											title={m.web_refresh_file_info()}
										>
											<RefreshCw className={cn("size-3.5", refreshingMediaFileId === file.id && "animate-spin")} />
										</Button>
									)}
									<Link to="/player/$id" params={{ id: file.id }} className="w-full sm:w-auto">
										<Button className="w-full gap-2 font-medium shadow-xs transition-transform active:scale-95 sm:w-auto">
											<Play className="size-3 transition-transform group-hover:scale-110" />
											{m.components_metadata_card_play()}
										</Button>
									</Link>
								</div>
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
