import { cn } from "cn";
import { ImageDown, Info, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { m } from "@/paraglide/messages";

interface MediaFilesDialogHeaderProps {
	filesCount: number;
	title?: string;
	isAdmin?: boolean;
	episodeId?: string;
	metadataId?: string;
	isRefreshingEpisode: boolean;
	isRefreshingEpisodeImage: boolean;
	isRefreshingMetadata: boolean;
	isRefreshingImages: boolean;
	onRefreshEpisode: () => void;
	onRefreshEpisodeImage: () => void;
	onRefreshMetadata: () => void;
	onRefreshImages: () => void;
}

type AdminRefreshButtonsProps = Pick<
	MediaFilesDialogHeaderProps,
	| "episodeId"
	| "metadataId"
	| "isRefreshingEpisode"
	| "isRefreshingEpisodeImage"
	| "isRefreshingMetadata"
	| "isRefreshingImages"
	| "onRefreshEpisode"
	| "onRefreshEpisodeImage"
	| "onRefreshMetadata"
	| "onRefreshImages"
>;

function AdminRefreshButtons({
	episodeId,
	metadataId,
	isRefreshingEpisode,
	isRefreshingEpisodeImage,
	isRefreshingMetadata,
	isRefreshingImages,
	onRefreshEpisode,
	onRefreshEpisodeImage,
	onRefreshMetadata,
	onRefreshImages,
}: AdminRefreshButtonsProps) {
	if (episodeId) {
		return (
			<>
				<Button
					variant="outline"
					size="sm"
					className="h-8 gap-1.5 text-xs"
					onClick={onRefreshEpisode}
					disabled={isRefreshingEpisode}
					title={m.components_media_files_refresh_episode_metadata()}
				>
					<RefreshCw className={cn("size-3.5", isRefreshingEpisode && "animate-spin")} />
					<span className="hidden sm:inline">{m.components_media_files_refresh_episode()}</span>
				</Button>
				<Button
					variant="outline"
					size="sm"
					className="h-8 gap-1.5 text-xs"
					onClick={onRefreshEpisodeImage}
					disabled={isRefreshingEpisodeImage}
					title={m.components_media_files_force_thumbnail()}
				>
					<ImageDown className={cn("size-3.5", isRefreshingEpisodeImage && "animate-spin")} />
					<span className="hidden sm:inline">{m.components_media_files_download_thumbnail()}</span>
				</Button>
			</>
		);
	}

	if (metadataId) {
		return (
			<>
				<Button
					variant="outline"
					size="sm"
					className="h-8 gap-1.5 text-xs"
					onClick={onRefreshMetadata}
					disabled={isRefreshingMetadata}
					title={m.components_metadata_card_refresh_metadata()}
				>
					<RefreshCw className={cn("size-3.5", isRefreshingMetadata && "animate-spin")} />
					<span className="hidden sm:inline">{m.components_metadata_card_refresh_metadata()}</span>
				</Button>
				<Button
					variant="outline"
					size="sm"
					className="h-8 gap-1.5 text-xs"
					onClick={onRefreshImages}
					disabled={isRefreshingImages}
					title={m.components_metadata_card_force_artwork()}
				>
					<ImageDown className={cn("size-3.5", isRefreshingImages && "animate-spin")} />
					<span className="hidden sm:inline">{m.components_media_files_fetch_graphics()}</span>
				</Button>
			</>
		);
	}

	return null;
}

export function MediaFilesDialogHeader({
	filesCount,
	title,
	isAdmin,
	episodeId,
	metadataId,
	isRefreshingEpisode,
	isRefreshingEpisodeImage,
	isRefreshingMetadata,
	isRefreshingImages,
	onRefreshEpisode,
	onRefreshEpisodeImage,
	onRefreshMetadata,
	onRefreshImages,
}: MediaFilesDialogHeaderProps) {
	return (
		<DialogHeader className="shrink-0 border-border border-b bg-muted/30 p-6 pb-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<DialogTitle className="flex items-center gap-2.5 font-bold text-foreground text-xl tracking-tight">
					<Info className="size-5 shrink-0 text-primary" />
					<span>{m.components_media_files_data_heading()}</span>
				</DialogTitle>
				<div className="flex flex-wrap items-center gap-2">
					{filesCount > 0 && (
						<Badge variant="secondary" className="px-2.5 py-1 font-mono text-xs">
							{m.common_files_count({ count: filesCount })}
						</Badge>
					)}
					{isAdmin && (
						<div className="flex items-center gap-1.5">
							<AdminRefreshButtons
								episodeId={episodeId}
								metadataId={metadataId}
								isRefreshingEpisode={isRefreshingEpisode}
								isRefreshingEpisodeImage={isRefreshingEpisodeImage}
								isRefreshingMetadata={isRefreshingMetadata}
								isRefreshingImages={isRefreshingImages}
								onRefreshEpisode={onRefreshEpisode}
								onRefreshEpisodeImage={onRefreshEpisodeImage}
								onRefreshMetadata={onRefreshMetadata}
								onRefreshImages={onRefreshImages}
							/>
						</div>
					)}
				</div>
			</div>
			<DialogDescription className="mt-1 text-muted-foreground text-sm">
				{title ? m.components_media_files_params_for({ title }) : m.components_media_files_params_quality_heading()}
			</DialogDescription>
		</DialogHeader>
	);
}
