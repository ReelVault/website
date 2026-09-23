import { Link } from "@tanstack/react-router";
import { Bookmark, Play, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import type { MetadataWithRelation, RequireFields } from "reelvault-sdk";
import type { metadataCardFields } from "@/client/utils/fields";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";
import type { getMetadataPoster } from "@/utils/metadata-utils";
import { ApiImage } from "../ui/api-image";
import { MetadataCardDropdownMenu } from "./metadata-card-dropdown-menu";
import { MetadataCardGenreBadges } from "./metadata-card-genre-badges";

export function MetadataCardPoster({
	metadata,
	size = "default",
	transitionName,
	poster,
	genres,
	isOnWatchlist,
	isInteracted,
	isSuggestionLoading,
	suggestion,
	isAdmin,
	isWatchlistPending,
	isMarkingWatched,
	onAddToWatchlist,
	onMarkWatched,
	onCopyLink,
	onCopyId,
	onOpenFileDetails,
	onOpenIdentify,
	onRefreshMetadata,
	onRefreshImages,
}: {
	metadata: RequireFields<MetadataWithRelation, typeof metadataCardFields>;
	size?: "default" | "lg";
	transitionName?: string;
	poster?: ReturnType<typeof getMetadataPoster>;
	genres: NonNullable<RequireFields<MetadataWithRelation, typeof metadataCardFields>["genres"]>;
	isOnWatchlist?: boolean;
	isInteracted: boolean;
	isSuggestionLoading: boolean;
	suggestion?: { mediaFileId?: string } | null;
	isAdmin: boolean;
	isWatchlistPending: boolean;
	isMarkingWatched?: boolean;
	onAddToWatchlist: () => void;
	onMarkWatched?: () => void;
	onCopyLink: () => void;
	onCopyId: () => void;
	onOpenFileDetails: () => void;
	onOpenIdentify: () => void;
	onRefreshMetadata: () => void;
	onRefreshImages: () => void;
}) {
	let overlayAction: ReactNode = null;
	if (suggestion?.mediaFileId) {
		overlayAction = (
			<Button
				size="icon-lg"
				aria-label={m.components_metadata_card_play_title({ title: metadata.title })}
				className="pointer-events-auto size-12 rounded-full shadow-2xl transition-transform duration-200 group-hover:scale-105"
				nativeButton={false}
				render={<Link to="/player/$id" params={{ id: suggestion.mediaFileId }} />}
			>
				<Play className="size-5 fill-current pl-0.5" aria-hidden="true" />
			</Button>
		);
	} else if (isInteracted && isSuggestionLoading) {
		overlayAction = (
			<Button
				size="icon-lg"
				disabled
				aria-label={m.components_metadata_card_loading_player()}
				className="pointer-events-auto size-12 rounded-full opacity-75 shadow-2xl"
			>
				<RefreshCw className="size-5 animate-spin" aria-hidden="true" />
			</Button>
		);
	}

	return (
		<div
			className="pointer-events-none relative z-20 overflow-hidden rounded-xl bg-card ring-primary/0 ring-offset-2 ring-offset-background transition-[box-shadow,transform] duration-200 group-hover:scale-[1.01] group-hover:ring-2"
			style={transitionName ? { viewTransitionName: transitionName } : undefined}
		>
			<AspectRatio ratio={2 / 3}>
				<ApiImage
					fileId={poster?.id}
					cacheKey={poster?.updatedAt}
					alt={metadata.title}
					width={size === "lg" ? 256 : 208}
					aspectRatio={2 / 3}
					sizes={size === "lg" ? "256px" : "208px"}
					className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
				/>

				{/* Subtle Watch Status & Quick Actions (Top Left) */}
				<div className="absolute top-2.5 left-2.5 z-30 flex items-center gap-1.5">
					{isOnWatchlist === true && (
						<div
							className="flex size-8 items-center justify-center rounded-full bg-accent/90 text-accent-foreground shadow-md"
							title={m.components_on_watchlist_title()}
						>
							<Bookmark className="size-4 fill-current" aria-hidden="true" />
						</div>
					)}
				</div>

				{/* Genre Tags (Clean static badges, non-jittery) */}
				<MetadataCardGenreBadges genres={genres} />

				{/* Interaction Overlays */}
				<div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/40 opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100">
					{overlayAction}

					{/* Action Menu (Bottom Right corner of the poster) */}
					<div className="pointer-events-auto absolute right-3 bottom-3">
						<MetadataCardDropdownMenu
							title={metadata.title}
							metadataId={metadata.id}
							mediaFileId={suggestion?.mediaFileId}
							isOnWatchlist={isOnWatchlist}
							isWatchlistPending={isWatchlistPending}
							isMarkingWatched={isMarkingWatched}
							isAdmin={isAdmin}
							onAddToWatchlist={onAddToWatchlist}
							onMarkWatched={onMarkWatched}
							onCopyLink={onCopyLink}
							onCopyId={onCopyId}
							onOpenFileDetails={onOpenFileDetails}
							onOpenIdentify={onOpenIdentify}
							onRefreshMetadata={onRefreshMetadata}
							onRefreshImages={onRefreshImages}
						/>
					</div>
				</div>
			</AspectRatio>
		</div>
	);
}
