import type { MediaFileWithRelation } from "@reelvault/sdk";
import { Link } from "@tanstack/react-router";
import { Clapperboard, Clock, FileVideo, HardDrive, Layers, RefreshCw, Save, Search, ShieldCheck, Trash2, Tv } from "lucide-react";
import { Suspense, useState } from "react";
import { useDeleteTrickplay } from "@/client/hooks/use-admin-trickplay";
import { AsyncButton } from "@/components/async-button";
import { ConfirmAction } from "@/components/confirm-action";
import { LazyReassignMediaFileDialog } from "@/components/lazy-dialogs";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdminBackLink } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { formatFileSize } from "@/utils/file-utils";
import { MediaFileReidentifyDialog } from "./media-file-reidentify-dialog";
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
	const [isReidentifyOpen, setIsReidentifyOpen] = useState(false);
	const deleteTrickplay = useDeleteTrickplay();

	return (
		<>
			<AdminBackLink to="/admin/media" label={m.admin_nav_media_files()} />

			<Card variant="subtle">
				<CardContent className="flex flex-col gap-4">
					<div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
						<div className="flex flex-col gap-1.5">
							<div className="flex flex-wrap items-center gap-2">
								<h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">{file.fileName}</h1>
								<Badge variant={isMovie ? "default" : "secondary"}>
									{isMovie ? <Clapperboard className="size-3" /> : <Tv className="size-3" />}
									{isMovie ? m.plugins_movie_word() : m.admin_media_episode_of_series()}
								</Badge>
								{file.qualityTag && <Badge variant="outline">{file.qualityTag}</Badge>}
								{file.edition && <Badge variant="secondary">{file.edition}</Badge>}
								<Badge tone="muted" variant="outline" font="mono">
									{m.common_truncated_id({ id: mediaFileId.slice(0, 8) })}
								</Badge>
							</div>
							<div className="text-muted-foreground flex flex-wrap items-center gap-4 text-xs">
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
							<Button variant="outline" size="sm" onClick={() => setIsReidentifyOpen(true)}>
								<Search className="text-primary size-4" />
								<span>{m.components_media_file_reidentify()}</span>
							</Button>

							<Button variant="outline" size="sm" onClick={() => setIsReassignDialogOpen(true)}>
								<Layers className="text-primary size-4" />
								<span>{m.components_media_file_change_metadata_assignment()}</span>
							</Button>

							<Button variant="outline" size="sm" onClick={() => setIsScanDialogOpen(true)}>
								<ShieldCheck className="text-success size-4" />
								<span>{m.admin_media_scan_file()}</span>
							</Button>

							<ConfirmAction
								trigger={
									<Button variant="outline" size="sm" disabled={deleteTrickplay.isPending}>
										<Trash2 className="text-destructive size-4" />
										<span>{m.admin_media_remove_trickplay()}</span>
									</Button>
								}
								title={m.admin_media_remove_trickplay_title()}
								description={m.admin_media_remove_trickplay_description()}
								confirmLabel={m.admin_media_remove_trickplay()}
								onConfirm={async () => {
									await deleteTrickplay.mutateAsync(mediaFileId);
								}}
							/>

							<AsyncButton
								variant="outline"
								size="sm"
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
								size="sm"
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
							className="border-primary/30 bg-primary/5 mt-4 flex flex-wrap items-center gap-2.5 rounded-xl border p-3 text-xs"
							aria-live="polite"
						>
							<StatusBadge status={refreshStatus === "pending" ? "pending" : "running"} label={m.admin_media_worker_in_progress()} />
							<span className="text-muted-foreground">{m.admin_media_reading_streams_notice()}</span>
							<Button variant="primary-ghost" size="sm" nativeButton={false} render={<Link to="/admin/worker" />}>
								{m.admin_media_show_in_worker()}
							</Button>
						</div>
					)}
				</CardContent>

				<MediaFileScanDialog
					open={isScanDialogOpen}
					onOpenChange={setIsScanDialogOpen}
					mediaFileId={mediaFileId}
					fileName={file.fileName}
				/>
				<MediaFileReidentifyDialog
					metadataId={file.metadataId}
					mediaType={isMovie ? "movie" : "tv_show"}
					open={isReidentifyOpen}
					onOpenChange={setIsReidentifyOpen}
				/>
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
		</>
	);
}
