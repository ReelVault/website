import { cn } from "cn";
import { ImageDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

interface AdminRefreshButtonsProps {
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

/** Admin-only refresh buttons for a title, or for an episode when one is given. */
export function AdminRefreshButtons({
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
					className="h-10 gap-1.5 text-xs sm:h-8"
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
					className="h-10 gap-1.5 text-xs sm:h-8"
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
					className="h-10 gap-1.5 text-xs sm:h-8"
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
					className="h-10 gap-1.5 text-xs sm:h-8"
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
