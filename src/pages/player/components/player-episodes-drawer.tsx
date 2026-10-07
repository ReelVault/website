import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { cn } from "cn";
import { Check, Layers, Play, SquareStack, Tv } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { reelvault } from "@/client/client";
import { useCollectionDetails } from "@/client/hooks/use-collections";
import { useEpisodes } from "@/client/hooks/use-episodes";
import { usePlaybackProgress } from "@/client/hooks/use-me-playback";
import { useMetadataCollection } from "@/client/hooks/use-metadata-queries";
import { mePlaybackKeys } from "@/client/utils/query-keys";
import { ApiImage } from "@/components/ui/api-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Progress } from "@/components/ui/progress";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { m } from "@/paraglide/messages";
import { formatDuration } from "@/utils/duration-utils";
import { usePlayerActions, usePlayerEpisodes, usePlayerInfo, usePlayerNextEpisode } from "../player-context";
import { detach } from "../utils/player-utils";
import { PlayerControlButton } from "./player-control-button";

const SKELETON_ITEMS = ["drawer-sk-1", "drawer-sk-2", "drawer-sk-3", "drawer-sk-4", "drawer-sk-5", "drawer-sk-6"];

function DrawerSkeletonList() {
	return (
		<div className="flex flex-col gap-2 pb-6">
			{SKELETON_ITEMS.map((key) => (
				<div key={key} className="flex gap-3 rounded-xl border border-border/40 p-3">
					<div className="aspect-video w-32 shrink-0 animate-pulse rounded-lg bg-muted sm:w-40" />
					<div className="flex-1 space-y-2 py-1">
						<div className="h-3 w-10 animate-pulse rounded bg-muted" />
						<div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
						<div className="mt-2 h-3 w-full animate-pulse rounded bg-muted" />
					</div>
				</div>
			))}
		</div>
	);
}

export function PlayerEpisodesDrawer() {
	const { episodeId, mediaFileId: currentMediaFileId, metadataId } = usePlayerInfo();
	const { currentEpisode } = usePlayerNextEpisode();
	const { seasons } = usePlayerEpisodes();
	const actions = usePlayerActions();
	const navigate = useNavigate();
	const search = useSearch({ from: "/player/$id" });
	const isCollectionMode = Boolean(search.collection);
	const collectionId = search.collectionId;

	const [isOpen, setIsOpen] = useState(false);
	const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);

	// Collection queries only while the drawer is open (like useEpisodes below).
	const collectionDetailsQuery = useCollectionDetails(collectionId ?? "", { enabled: isOpen });
	const sortMode = collectionDetailsQuery.data?.sortMode ?? "release_date";
	const collectionQuery = useMetadataCollection(
		collectionId ?? undefined,
		{
			sortBy: sortMode === "manual" ? "collectionOrder" : "releaseDate",
			sortOrder: "asc",
		},
		{ enabled: isOpen },
	);
	const collectionItems = collectionQuery.data?.data ?? [];
	// ONE batched call for every collection item's smart-play suggestion + watchlist
	// flag — per-item hooks fired N requests the moment the drawer opened.
	const collectionIds = collectionItems.map((movie) => movie.id);
	const collectionSuggestionsQuery = useQuery({
		queryKey: mePlaybackKeys.suggestionsBatch(collectionIds),
		queryFn: () => reelvault.me.getPlaybackSuggestionsBatch(collectionIds),
		enabled: isCollectionMode && collectionIds.length > 0,
		staleTime: 30_000,
	});
	const suggestionsById = new Map((collectionSuggestionsQuery.data?.suggestions ?? []).map((entry) => [entry.metadataId, entry]));

	const currentRowRef = useRef<HTMLButtonElement | null>(null);
	const hasScrolledToCurrentRef = useRef(false);

	const activeSeasonId =
		selectedSeasonId ?? seasons.find((s) => s.seasonNumber === currentEpisode?.seasonNumber)?.id ?? seasons[0]?.id ?? null;

	// No explicit limit = the server's default page size (20) silently truncates
	// the season; 500 is the server hard max and covers any real season.
	const episodesQuery = useEpisodes(episodeId && isOpen ? activeSeasonId : null, { limit: 500 });
	const episodes = episodesQuery.data?.data ?? [];

	// Per-title watched state feeds the checkmarks/progress rows — fetched only
	// while the drawer is open (the controller no longer preloads it).
	const playbackQuery = usePlaybackProgress(metadataId, { enabled: isOpen && metadataId.trim().length > 0 });
	// Optional-shaped view: rows render for episodes missing from the map.
	const playback:
		| {
				totalEpisodes?: number;
				completedEpisodes?: number;
				episodes?: Record<string, { status?: string; progress?: { position?: number; duration?: number } | null }>;
		  }
		| undefined = playbackQuery.data ?? undefined;

	// The list mounts only after the drawer opens (the query is enabled then) —
	// scroll once the episodes have actually rendered, not in handleOpenChange.
	useEffect(() => {
		if (!isOpen || episodesQuery.isPending || hasScrolledToCurrentRef.current) return;

		hasScrolledToCurrentRef.current = true;
		currentRowRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
	}, [episodesQuery.isPending, isOpen]);

	// If it is a movie and we are not in collection mode, do not render the button
	if (!(episodeId || (isCollectionMode && collectionId))) return null;

	const handleSelectEpisode = (targetMediaFileId: string) => {
		if (targetMediaFileId === currentMediaFileId) {
			setIsOpen(false);

			return;
		}

		// Explicit episode choice — the next episode must start playing even though
		// the controller instance (and its play intent) survives the navigation.
		actions.setUserPlayIntent(true);
		detach(() => actions.syncPlaybackProgress(true));
		setIsOpen(false);
		detach(() =>
			navigate({
				to: "/player/$id",
				params: { id: targetMediaFileId },
				search: isCollectionMode ? { collection: true, collectionId } : undefined,
				replace: true,
			}),
		);
	};

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open);
		if (open) {
			// A fresh open re-anchors on the episode being watched: drop the season
			// the user last browsed for a previous episode.
			setSelectedSeasonId(null);
			hasScrolledToCurrentRef.current = false;
		}
	};

	let headerBadge: ReactNode = null;
	if (isCollectionMode) {
		headerBadge = (
			<Badge variant="secondary" className="border-none bg-primary/15 px-3 py-1 font-semibold text-primary text-sm hover:bg-primary/20">
				{m.player_collection_mode_badge()}
			</Badge>
		);
	} else if (currentEpisode) {
		headerBadge = (
			<Badge variant="secondary" className="border-none bg-primary/15 px-3 py-1 font-semibold text-primary text-sm hover:bg-primary/20">
				{m.player_now_playing_badge({
					season: currentEpisode.seasonNumber,
					episode: currentEpisode.episodeNumber,
				})}
			</Badge>
		);
	}

	let listContent: ReactNode;
	if (isCollectionMode) {
		listContent = collectionQuery.isPending ? (
			<DrawerSkeletonList />
		) : (
			<div className="flex flex-col gap-2 pb-6">
				{collectionItems.map((movie, index) => {
					const poster = movie.images.find((img) => img.imageType === "poster")?.data;
					const entry = suggestionsById.get(movie.id);
					const targetMediaFileId = entry?.suggestion?.mediaFileId;

					return (
						<DrawerItemRow
							key={movie.id}
							number={index + 1}
							title={movie.title}
							overview={movie.overview}
							imageFileId={poster?.id}
							imageCacheKey={poster?.updatedAt}
							imageAlt={movie.title}
							isCurrent={movie.id === metadataId}
							isDisabled={!targetMediaFileId || collectionSuggestionsQuery.isPending}
							onSelect={() => targetMediaFileId && handleSelectEpisode(targetMediaFileId)}
						/>
					);
				})}
			</div>
		);
	} else if (episodesQuery.isPending) {
		listContent = <DrawerSkeletonList />;
	} else if (episodes.length === 0) {
		listContent = (
			<div className="flex h-48 flex-col items-center justify-center text-muted-foreground">
				<Tv className="mb-3 size-10 opacity-20" />
				<p className="text-sm">{m.player_no_episodes_in_season()}</p>
			</div>
		);
	} else {
		listContent = (
			<div className="flex flex-col gap-2 pb-6">
				{episodes.map((episode) => {
					const files = episode.mediaFiles;
					const defaultFile = files.find((f) => f.isDefault) ?? files[0];
					const targetMediaFileId = defaultFile?.id;
					const isCurrent = episode.id === episodeId || targetMediaFileId === currentMediaFileId;
					const progress = playback?.episodes?.[episode.id]?.progress;
					const progressPercent = progress?.duration ? Math.round(((progress.position ?? 0) / progress.duration) * 100) : 0;
					const isWatched = playback?.episodes?.[episode.id]?.status === "watched";

					return (
						<DrawerItemRow
							key={episode.id}
							ref={isCurrent ? (el) => (currentRowRef.current = el) : undefined}
							number={episode.episodeNumber}
							title={episode.title ?? m.player_episode_number_word({ number: episode.episodeNumber })}
							overview={episode.overview}
							imageFileId={episode.imageId}
							imageAlt={episode.title ?? m.player_episode_number_word({ number: episode.episodeNumber })}
							durationLabel={defaultFile?.duration ? formatDuration(defaultFile.duration) : undefined}
							isCurrent={isCurrent}
							isWatched={isWatched && !isCurrent}
							progressPercent={progressPercent > 0 && progressPercent < 100 ? progressPercent : undefined}
							isDisabled={!targetMediaFileId}
							onSelect={() => targetMediaFileId && handleSelectEpisode(targetMediaFileId)}
						/>
					);
				})}
			</div>
		);
	}

	return (
		<Drawer open={isOpen} onOpenChange={handleOpenChange} swipeDirection="right">
			<PlayerControlButton
				description={isCollectionMode ? m.web_movie_collection() : m.player_seasons_and_episodes()}
				render={<DrawerTrigger aria-label={isCollectionMode ? m.web_movie_collection() : m.player_seasons_and_episodes()} />}
			>
				{isCollectionMode ? <Layers className="size-5" aria-hidden="true" /> : <SquareStack className="size-5" aria-hidden="true" />}
			</PlayerControlButton>

			<DrawerContent className="fixed inset-y-0 right-0 flex h-full w-full flex-col border-border border-l bg-background sm:max-w-md md:max-w-lg">
				<DrawerHeader className="shrink-0 space-y-4 border-border/60 border-b px-5 pt-5 pb-4 text-left">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div className="space-y-1">
							<DrawerTitle className="font-bold text-foreground text-xl tracking-tight sm:text-2xl">
								{isCollectionMode ? (collectionDetailsQuery.data?.name ?? m.web_collections_kicker()) : m.player_seasons_episodes()}
							</DrawerTitle>
							<DrawerDescription className="flex items-center gap-2 text-muted-foreground text-sm">
								{isCollectionMode ? (
									<span className="font-medium">{m.common_titles_count({ count: collectionItems.length })}</span>
								) : (
									<>
										{seasons.length > 0 && <span className="font-medium">{m.common_seasons_count({ count: seasons.length })}</span>}
										{playback?.totalEpisodes ? (
											<>
												<span className="size-1 rounded-full bg-muted-foreground/50" />
												<span>
													{m.player_completed_of_total_episodes({
														completed: playback.completedEpisodes ?? 0,
														total: playback.totalEpisodes,
													})}
												</span>
											</>
										) : null}
									</>
								)}
							</DrawerDescription>
						</div>

						{headerBadge}
					</div>

					{/* Season picker */}
					{!isCollectionMode && seasons.length > 0 && (
						<ScrollArea className="w-full whitespace-nowrap">
							<div className="flex w-max gap-2 py-1">
								{seasons.map((season) => {
									const isSelected = season.id === activeSeasonId;

									return (
										<Button
											key={season.id}
											type="button"
											aria-pressed={isSelected}
											variant={isSelected ? "default" : "outline"}
											size="sm"
											onClick={() => setSelectedSeasonId(season.id)}
											className={cn(
												"rounded-full font-semibold text-sm transition-[border-color,background-color,color,box-shadow] duration-200",
												isSelected ? "shadow-md" : "hover:bg-muted/80",
											)}
										>
											{season.seasonNumber === 0
												? m.player_special_episodes()
												: m.components_season_number_label({ number: season.seasonNumber })}
										</Button>
									);
								})}
							</div>
							<ScrollBar orientation="horizontal" className="invisible" />
						</ScrollArea>
					)}
				</DrawerHeader>

				{/* Item list */}
				<div className="custom-scrollbar flex-1 overflow-y-auto px-4 py-3">{listContent}</div>
			</DrawerContent>
		</Drawer>
	);
}

interface DrawerItemRowProps {
	number: number;
	title: string;
	overview?: string | null;
	imageFileId?: string | null;
	imageCacheKey?: Date | string | null;
	imageAlt: string;
	durationLabel?: string;
	isCurrent: boolean;
	isWatched?: boolean;
	progressPercent?: number;
	isDisabled?: boolean;
	ref?: (el: HTMLButtonElement | null) => void;
	onSelect: () => void;
}

function DrawerItemRow({
	number,
	title,
	overview,
	imageFileId,
	imageCacheKey,
	imageAlt,
	durationLabel,
	isCurrent,
	isWatched = false,
	progressPercent = 0,
	isDisabled = false,
	ref,
	onSelect,
}: DrawerItemRowProps) {
	return (
		<button
			type="button"
			ref={ref}
			disabled={isDisabled}
			onClick={onSelect}
			className={cn(
				"group relative flex w-full cursor-pointer items-start gap-4 rounded-xl border p-3 text-left outline-none transition-[border-color,background-color,color,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
				isCurrent
					? "border-primary/60 border-l-4 bg-primary/[0.07] shadow-sm"
					: "border-transparent bg-muted/30 hover:border-border/60 hover:bg-muted/60",
				isDisabled && "cursor-not-allowed opacity-50 grayscale-50",
			)}
		>
			{/* Number — readable, fixed slot independent of the thumbnail */}
			<div className="flex w-7 shrink-0 items-center justify-center pt-1">
				<span className={cn("font-bold text-base tabular-nums", isCurrent ? "text-primary" : "text-muted-foreground/70")}>{number}</span>
			</div>

			{/* Thumbnail */}
			<div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-md border border-border/40 shadow-sm sm:w-32">
				<ApiImage
					fileId={imageFileId}
					cacheKey={imageCacheKey}
					alt={imageAlt}
					fill
					sizes="128px"
					className="object-cover transition-transform duration-500 group-hover:scale-105"
				/>

				<div
					className={cn(
						"absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-300",
						isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100",
					)}
				>
					<div className="flex size-9 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg transition-transform group-hover:scale-110 sm:size-10">
						<Play className="ml-1 size-4 fill-current sm:size-5" />
					</div>
				</div>

				{durationLabel && (
					<span className="absolute right-1.5 bottom-1.5 rounded-md bg-black/80 px-1.5 py-0.5 font-medium text-[10px] text-white/90">
						{durationLabel}
					</span>
				)}
			</div>

			{/* Information */}
			<div className="flex h-full min-w-0 flex-1 flex-col justify-center space-y-1.5 py-0.5">
				<div className="flex items-center gap-2">
					{isCurrent && (
						<Badge className="border-none bg-primary/20 px-1.5 py-0 font-semibold text-[10px] text-primary uppercase tracking-wider hover:bg-primary/20">
							{m.player_playing_word()}
						</Badge>
					)}
					{isWatched && (
						<span className="flex items-center gap-1 font-medium text-[11px] text-success">
							<Check className="size-3.5" /> {m.player_watched_word()}
						</span>
					)}
				</div>

				<h4
					className={cn(
						"line-clamp-1 font-semibold text-base transition-colors",
						isCurrent ? "text-primary" : "text-foreground group-hover:text-foreground/90",
					)}
				>
					{title}
				</h4>

				{overview && <p className="line-clamp-2 text-muted-foreground text-sm leading-relaxed">{overview}</p>}

				{progressPercent > 0 && progressPercent < 100 && (
					<div className="flex items-center gap-2 pt-1">
						<Progress value={progressPercent} className="h-1.5 flex-1 bg-muted-foreground/20" />
						<span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
							{m.common_percent_value({ value: progressPercent })}
						</span>
					</div>
				)}
			</div>
		</button>
	);
}
