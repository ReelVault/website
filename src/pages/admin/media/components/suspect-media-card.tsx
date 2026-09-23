import { Link } from "@tanstack/react-router";
import { AlertTriangle, FileVideo, Layers } from "lucide-react";
import { Suspense, useState } from "react";
import type { MediaFileAuditItem } from "reelvault-sdk";
import { LazyReassignMediaFileDialog } from "@/components/lazy-dialogs";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { m } from "@/paraglide/messages";
import { translateByKey } from "@/utils/translate-error";

export function SuspectMediaCard({ item, onFixed }: { item: MediaFileAuditItem; onFixed: () => void }) {
	const [isReassignDialogOpen, setIsReassignDialogOpen] = useState(false);

	const isMovie = item.mediaType === "movie";

	return (
		<>
			<div className="flex flex-col justify-between gap-4 rounded-xl border border-destructive/30 bg-card p-5 shadow-2xs transition-[border-color,background-color,color,box-shadow] duration-150 hover:border-destructive/60 hover:shadow-sm">
				{/* Top Header: Filename & Path */}
				<div className="flex flex-col gap-2">
					<div className="flex items-start justify-between gap-3">
						<div className="flex min-w-0 items-center gap-3">
							<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive shadow-2xs">
								<FileVideo className="size-5" />
							</div>
							<div className="min-w-0">
								<p className="truncate font-semibold text-foreground text-sm tracking-tight">{item.fileName}</p>
								<p className="truncate font-mono text-muted-foreground text-xs">{item.filePath}</p>
							</div>
						</div>
						{item.libraryName && (
							<Badge variant="outline" className="shrink-0 text-xs">
								{item.libraryName}
							</Badge>
						)}
					</div>

					{/* Issues Badges */}
					<div className="mt-1 flex flex-wrap gap-1.5">
						{item.reasons.map((r) => {
							const key = `${r.code}-${r.params ? JSON.stringify(r.params) : ""}`;
							if (r.severity === "high") {
								return (
									<Badge key={key} variant="destructive" className="gap-1 font-medium text-xs">
										<AlertTriangle className="size-3" />
										{r.code === "sequel_mismatch" && m.admin_media_part_mismatch()}
										{r.code === "year_mismatch" && m.admin_media_year_mismatch()}
										{r.code === "title_mismatch" && m.admin_media_low_similarity()}
										{r.code === "episode_mismatch" && m.admin_media_episode_mismatch()}
										{r.code === "season_mismatch" && m.admin_media_season_mismatch()}
										{r.code === "low_confidence" && m.admin_media_low_confidence()}
									</Badge>
								);
							}

							return (
								<Badge key={key} variant="outline" className="gap-1 border-warning/50 bg-warning/10 font-medium text-warning text-xs">
									<AlertTriangle className="size-3" />
									{r.code === "year_mismatch" && m.admin_media_year_mismatch()}
									{r.code === "low_confidence" && m.admin_media_low_confidence()}
									{r.code === "title_mismatch" && m.admin_media_title_similarity()}
									{r.code === "episode_mismatch" && m.admin_media_episode_word()}
									{r.code === "season_mismatch" && m.admin_media_season_word()}
									{r.code === "sequel_mismatch" && m.admin_media_part()}
								</Badge>
							);
						})}
					</div>

					{/* Detailed Messages */}
					<div className="mt-1 flex flex-col gap-1 rounded-lg border border-border/50 bg-muted/30 p-2.5 text-xs">
						{item.reasons.map((r) => (
							<p key={`msg-${r.code}-${r.params ? JSON.stringify(r.params) : ""}`} className="text-muted-foreground">
								{m.admin_media_reason_bullet({ reason: translateByKey(r.code, r.params) })}
							</p>
						))}
					</div>
				</div>

				{/* Comparison Grid: Recognized vs Assigned */}
				<div className="grid grid-cols-1 gap-2 rounded-xl border border-border/60 bg-muted/20 p-3 sm:grid-cols-2">
					{/* Left: Recognized from file */}
					<div className="flex flex-col gap-1 rounded-lg border border-border/40 bg-background/60 p-2.5">
						<span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
							{m.admin_media_recognized_from_file()}
						</span>
						<p className="font-bold text-foreground text-sm">{item.recognized.title}</p>
						<div className="flex flex-wrap gap-2 text-muted-foreground text-xs">
							{item.recognized.year && <span>{m.admin_media_year_label({ year: item.recognized.year })}</span>}
							{!isMovie && item.recognized.season !== null && (
								<span>
									{m.admin_media_season_episode({ season: item.recognized.season ?? "?", episode: item.recognized.episode ?? "?" })}
								</span>
							)}
						</div>
					</div>

					{/* Right: Currently assigned */}
					<div className="flex flex-col gap-1 rounded-lg border border-border/40 bg-background/60 p-2.5">
						<span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">{m.admin_media_current_metadata()}</span>
						<p className="font-bold text-foreground text-sm">{item.currentMetadata.title}</p>
						{item.currentMetadata.originalTitle &&
							item.currentMetadata.originalTitle.trim().toLowerCase() !== item.currentMetadata.title.trim().toLowerCase() && (
								<p className="text-muted-foreground text-xs italic">
									{m.admin_media_original_title_label({ title: item.currentMetadata.originalTitle })}
								</p>
							)}
						<div className="flex flex-wrap gap-2 text-muted-foreground text-xs">
							{item.currentMetadata.releaseDate && (
								<span>{m.admin_media_premiere_date_label({ date: item.currentMetadata.releaseDate.slice(0, 10) })}</span>
							)}
							{!isMovie && item.currentMetadata.seasonNumber !== null && (
								<span>
									{m.admin_media_season_episode({
										season: item.currentMetadata.seasonNumber ?? "?",
										episode: item.currentMetadata.episodeNumber ?? "?",
									})}
								</span>
							)}
						</div>
					</div>
				</div>

				{/* Actions */}
				<div className="flex flex-wrap items-center justify-between gap-2 border-border/50 border-t pt-3">
					<div className="flex items-center gap-2">
						<Link
							to="/admin/media/$id"
							params={{ id: item.mediaFileId }}
							className={buttonVariants({ variant: "ghost", size: "sm", className: "h-8 text-muted-foreground text-xs" })}
						>
							{m.admin_media_edit_file()}
						</Link>
						<Link
							to="/admin/metadata/$id"
							params={{ id: item.currentMetadata.id }}
							className={buttonVariants({ variant: "ghost", size: "sm", className: "h-8 text-muted-foreground text-xs" })}
						>
							{m.admin_media_view_metadata()}
						</Link>
					</div>

					<Button variant="default" size="sm" className="gap-2 shadow-2xs" onClick={() => setIsReassignDialogOpen(true)}>
						<Layers className="size-4" />
						<span>{m.admin_media_change_assignment()}</span>
					</Button>
				</div>
			</div>

			{isReassignDialogOpen && (
				<Suspense fallback={null}>
					<LazyReassignMediaFileDialog
						open={isReassignDialogOpen}
						onOpenChange={setIsReassignDialogOpen}
						mediaFileId={item.mediaFileId}
						fileName={item.fileName}
						mediaType={item.mediaType}
						onSuccess={onFixed}
					/>
				</Suspense>
			)}
		</>
	);
}
