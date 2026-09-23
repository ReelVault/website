import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { Check, Copy, ImageDown, Info, Layers, Play, RefreshCw, RotateCcw, Shield } from "lucide-react";
import {
	ContextMenuContent,
	ContextMenuGroup,
	ContextMenuItem,
	ContextMenuLabel,
	ContextMenuSeparator,
	ContextMenuShortcut,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
} from "@/components/ui/context-menu";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { type EpisodeVersionFile, getVersionSubtitle, getVersionTitle, handleCopyEpisodeLink, handleCopyId } from "./details-episode-utils";

interface DetailsEpisodeContextMenuProps {
	episodeId: string;
	episodeNumber: number;
	episodeTitle: string;
	files: EpisodeVersionFile[];
	mediaFileId?: string;
	isWatched: boolean;
	hasProgress: boolean;
	isEpisodePending: boolean;
	isAdmin?: boolean;
	onToggleWatched: () => void;
	onResetProgress: () => void;
	onSelectForFiles: (ep: { id: string; number: number; title?: string | null }) => void;
	onRefreshEpisode?: (id: string) => void;
	onRefreshImage?: (id: string) => void;
}

export function DetailsEpisodeContextMenu({
	episodeId,
	episodeNumber,
	episodeTitle,
	files,
	mediaFileId,
	isWatched,
	hasProgress,
	isEpisodePending,
	isAdmin,
	onToggleWatched,
	onResetProgress,
	onSelectForFiles,
	onRefreshEpisode,
	onRefreshImage,
}: DetailsEpisodeContextMenuProps) {
	const hasMultipleVersions = files.length > 1;

	return (
		<ContextMenuContent className="w-64 border-border bg-popover shadow-xl">
			<ContextMenuGroup>
				<ContextMenuLabel className="truncate font-bold text-foreground text-xs uppercase tracking-wider">{episodeTitle}</ContextMenuLabel>
			</ContextMenuGroup>
			<ContextMenuSeparator />
			<ContextMenuGroup>
				{hasMultipleVersions ? (
					<ContextMenuSub>
						<ContextMenuSubTrigger className="cursor-pointer gap-2.5">
							<Layers className="size-4 text-primary" />
							<span>{m.web_play_version_count({ filesCount: files.length })}</span>
						</ContextMenuSubTrigger>
						<ContextMenuSubContent className="w-72 border-border bg-popover p-1 shadow-2xl">
							{files.map((file, idx) => (
								<ContextMenuItem
									key={file.id}
									render={<Link to="/player/$id" params={{ id: file.id }} />}
									className="cursor-pointer gap-2.5 py-2"
								>
									<Play className="size-3.5 shrink-0 text-primary" />
									<div className="flex min-w-0 flex-1 flex-col gap-0.5">
										<div className="flex items-center gap-1.5 truncate font-medium text-sm">
											<span className="truncate">{getVersionTitle(file, idx)}</span>
											{file.isDefault && <span className="text-[10px] text-primary">{m.web_default()}</span>}
										</div>
										<span className="truncate text-muted-foreground text-xs">{getVersionSubtitle(file)}</span>
									</div>
								</ContextMenuItem>
							))}
						</ContextMenuSubContent>
					</ContextMenuSub>
				) : (
					mediaFileId && (
						<ContextMenuItem render={<Link to="/player/$id" params={{ id: mediaFileId }} />} className="cursor-pointer gap-2.5">
							<Play className="size-4 fill-primary/20 text-primary" />
							<span>{m.web_play_episode()}</span>
							<ContextMenuShortcut>{m.common_key_enter()}</ContextMenuShortcut>
						</ContextMenuItem>
					)
				)}
				<ContextMenuItem
					onClick={() =>
						onSelectForFiles({
							id: episodeId,
							number: episodeNumber,
							title: episodeTitle,
						})
					}
					className="cursor-pointer gap-2.5"
				>
					<Info className="size-4 text-muted-foreground" />
					<span>{m.web_files_info_with_count({ count: files.length })}</span>
				</ContextMenuItem>
				<ContextMenuItem
					onClick={() => {
						detach(handleCopyEpisodeLink(mediaFileId));
					}}
					className="cursor-pointer gap-2.5"
				>
					<Copy className="size-4 text-muted-foreground" />
					<span>{m.common_copy_link()}</span>
				</ContextMenuItem>
			</ContextMenuGroup>

			{mediaFileId && (
				<>
					<ContextMenuSeparator />
					<ContextMenuGroup>
						<ContextMenuItem disabled={isEpisodePending} onClick={onToggleWatched} className="cursor-pointer gap-2.5">
							<Check className={cn("size-4", isWatched ? "text-success" : "text-muted-foreground")} />
							<span>{isWatched ? m.components_unmark_watched() : m.components_mark_watched()}</span>
						</ContextMenuItem>
						{(hasProgress || isWatched) && (
							<ContextMenuItem disabled={isEpisodePending} onClick={onResetProgress} className="cursor-pointer gap-2.5">
								<RotateCcw className="size-4 text-muted-foreground" />
								<span>{m.components_cw_reset_progress_button()}</span>
							</ContextMenuItem>
						)}
					</ContextMenuGroup>
				</>
			)}

			{isAdmin && (
				<>
					<ContextMenuSeparator />
					<ContextMenuGroup>
						<ContextMenuLabel className="flex items-center gap-1.5 font-bold text-[10px] text-primary uppercase tracking-widest">
							<Shield className="size-3" />
							{m.common_admin_tools()}
						</ContextMenuLabel>
						{onRefreshEpisode && (
							<ContextMenuItem onClick={() => onRefreshEpisode(episodeId)} className="cursor-pointer gap-2.5">
								<RefreshCw className="size-4 text-primary" />
								<span>{m.components_media_files_refresh_episode_metadata()}</span>
							</ContextMenuItem>
						)}
						{onRefreshImage && (
							<ContextMenuItem onClick={() => onRefreshImage(episodeId)} className="cursor-pointer gap-2.5">
								<ImageDown className="size-4 text-primary" />
								<span>{m.web_force_download_thumbnail()}</span>
							</ContextMenuItem>
						)}
						<ContextMenuItem
							onClick={() => {
								detach(handleCopyId(episodeId));
							}}
							className="cursor-pointer gap-2.5"
						>
							<Copy className="size-4 text-muted-foreground" />
							<span>{m.web_copy_episode_id()}</span>
						</ContextMenuItem>
					</ContextMenuGroup>
				</>
			)}
		</ContextMenuContent>
	);
}
