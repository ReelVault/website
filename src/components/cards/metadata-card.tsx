import type { MetadataWithRelation, RequireFields } from "@reelvault/sdk";
import { Link, useNavigate } from "@tanstack/react-router";
import { cn } from "cn";
import { Star } from "lucide-react";
import { startTransition } from "react";
import type { metadataCardFields } from "@/client/utils/fields";
import { Badge } from "@/components/ui/badge";
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import { m } from "@/paraglide/messages";
import { getYearFromDate } from "@/utils/date-utils";
import { formatRating } from "@/utils/format-utils";
import { getMetadataPoster } from "@/utils/metadata-utils";
import { MetadataCardContextMenu } from "./metadata-card-context-menu";
import { MetadataCardDialogs } from "./metadata-card-dialogs";
import { MetadataCardPoster } from "./metadata-card-poster";
import { useLongPressContextMenu } from "./use-long-press-context-menu";
import { useMetadataCardActions } from "./use-metadata-card-actions";

export function MetadataCard({
	metadata,
	size = "default",
	fluid = false,
	transitionName,
}: {
	metadata: RequireFields<MetadataWithRelation, typeof metadataCardFields>;
	size?: "default" | "lg";
	/** Fills the parent grid cell instead of holding a fixed width — for poster grids. */
	fluid?: boolean;
	/**
	 * `<ViewTransition>` name for the poster (shared element). Set it in only one
	 * place at once with the same name (e.g. library grid ↔ details hero),
	 * so the "share" transition smoothly carries the poster between pages.
	 */
	transitionName?: string;
}) {
	const navigate = useNavigate();
	const actions = useMetadataCardActions(metadata);
	const longPress = useLongPressContextMenu();

	const genres = metadata.genres;
	const poster = getMetadataPoster(metadata);
	const year = getYearFromDate(metadata.releaseDate);

	let widthClass: string;
	if (fluid) {
		widthClass = size === "lg" ? "w-full max-w-64" : "w-full max-w-52";
	} else {
		widthClass = size === "lg" ? "w-64" : "w-52";
	}

	return (
		<>
			<ContextMenu>
				<ContextMenuTrigger
					onMouseEnter={actions.handleInteract}
					onFocus={actions.handleInteract}
					onContextMenu={actions.handleInteract}
					onPointerDown={longPress.onPointerDown}
					onPointerMove={longPress.onPointerMove}
					onPointerUp={longPress.onPointerUp}
					onPointerCancel={longPress.onPointerCancel}
					onClickCapture={longPress.onClickCapture}
					tabIndex={0}
					role="link"
					aria-label={m.components_metadata_card_view_details_title({ title: metadata.title })}
					data-spatial
					onKeyDown={(event) => {
						if (event.key === "Enter") {
							event.preventDefault();
							// Transition consumes the navigation promise without leaving it floating.
							startTransition(() => navigate({ to: "/details/$id", params: { id: metadata.id } }));
						}
					}}
					className={cn("group relative flex flex-col gap-3", widthClass)}
				>
					{/* POSTER CONTAINER — viewTransitionName pairs the poster with the page hero
					    details on navigation (router View Transitions, globals.css). */}
					<MetadataCardPoster
						metadata={metadata}
						size={size}
						transitionName={transitionName}
						poster={poster}
						genres={genres}
						isOnWatchlist={actions.isOnWatchlist}
						isInteracted={actions.isInteracted}
						isSuggestionLoading={actions.isSuggestionLoading}
						suggestion={actions.suggestion}
						isAdmin={actions.isAdmin}
						isWatchlistPending={actions.isWatchlistPending}
						isMarkingWatched={actions.isMarkingWatched}
						onAddToWatchlist={actions.handleAddToWatchlist}
						onMarkWatched={actions.handleMarkWatched}
						onCopyLink={actions.handleCopyLink}
						onCopyId={actions.handleCopyId}
						onOpenFileDetails={actions.handleOpenFileDetails}
						onOpenIdentify={actions.handleOpenIdentify}
						onRefreshMetadata={actions.handleRefreshMetadata}
						onRefreshImages={actions.handleRefreshImages}
					/>

					{/* TEXT INFO */}
					<div className="flex flex-col gap-0.5 px-1">
						<h3 className="line-clamp-1 font-semibold text-foreground text-sm tracking-tight transition-colors group-hover:text-primary">
							{metadata.title}
						</h3>
						<div className="flex items-center gap-2">
							<span className="font-bold text-[10px] text-muted-foreground">{year}</span>
							{metadata.rating.avgScore > 0 && (
								<>
									<div className="h-1 w-1 rounded-full bg-border" />
									<Badge variant="secondary" size="sm" className="gap-1 bg-warning/10 text-warning">
										<Star className="size-3 fill-current" aria-hidden="true" />
										{formatRating(metadata.rating.avgScore)}
									</Badge>
								</>
							)}
						</div>
					</div>

					{/* Link covering the whole card — visual hit area; navigation is handled by the named trigger above */}
					<Link
						to="/details/$id"
						params={{ id: metadata.id }}
						tabIndex={-1}
						aria-hidden="true"
						className="absolute inset-0 z-10 rounded-xl focus-visible:outline-none"
					/>
				</ContextMenuTrigger>

				{/* CONTEXT MENU (PRAWY PRZYCISK MYSZY) */}
				<MetadataCardContextMenu
					title={metadata.title}
					metadataId={metadata.id}
					mediaFileId={actions.suggestion?.mediaFileId}
					isOnWatchlist={actions.isOnWatchlist}
					isWatchlistPending={actions.isWatchlistPending}
					isMarkingWatched={actions.isMarkingWatched}
					isAdmin={actions.isAdmin}
					onAddToWatchlist={actions.handleAddToWatchlist}
					onMarkWatched={actions.handleMarkWatched}
					onCopyLink={actions.handleCopyLink}
					onCopyId={actions.handleCopyId}
					onOpenFileDetails={actions.handleOpenFileDetails}
					onOpenIdentify={actions.handleOpenIdentify}
					onRefreshMetadata={actions.handleRefreshMetadata}
					onRefreshImages={actions.handleRefreshImages}
				/>
			</ContextMenu>

			{/* DIALOGI AKCYJNE */}
			<MetadataCardDialogs
				metadataId={metadata.id}
				title={metadata.title}
				mediaType={metadata.type}
				year={year}
				fileDetailsOpen={actions.fileDetailsOpen}
				onFileDetailsOpenChange={actions.setFileDetailsOpen}
				isAdmin={actions.isAdmin}
				identifyOpen={actions.identifyOpen}
				onIdentifyOpenChange={actions.setIdentifyOpen}
			/>
		</>
	);
}
