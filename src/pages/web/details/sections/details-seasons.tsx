import { Tv } from "lucide-react";
import { useState } from "react";
import { useCurrentUser } from "@/client/hooks/use-current-profile";
import { useDetailsView } from "@/client/hooks/use-metadata-queries";
import { useSeasons } from "@/client/hooks/use-seasons";
import { AppErrorState } from "@/components/app-states";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { DetailsEpisodes } from "../components/details-episodes";
import { DetailsSection } from "../components/details-section";

const isKnownSeason = (seasons: Array<{ id: string }>, seasonId: string | null | undefined): seasonId is string =>
	seasonId !== null && seasonId !== undefined && seasons.some((season) => season.id === seasonId);

export function DetailsSeasons({ metadataId, isAdmin }: { metadataId: string; isAdmin?: boolean }) {
	const seasonsQuery = useSeasons(metadataId);
	// Episode progress comes from the details-view composite.
	const { data: view } = useDetailsView(metadataId);
	const { profile } = useCurrentUser();
	const playback = view?.userState.progress ?? undefined;
	const seasons = seasonsQuery.data?.data ?? [];
	const defaultSeasonId = (seasons.find((season) => season.seasonNumber === 1) ?? seasons[0])?.id ?? null;
	// Profile-scoped: the picked season belongs to the profile, not the device.
	const storageKey = `reelvault:season:${profile?.id ?? "none"}:${metadataId}`;

	// Read the saved choice once (lazy init — SPA, no hydration); the season is derived:
	// user choice → localStorage → season 1. A dead choice falls back to the default.
	const [storedSeasonId] = useState(() => localStorage.getItem(storageKey));
	const [pickedSeasonId, setPickedSeasonId] = useState<string | null>(null);

	const resolveSelectedSeasonId = (): string | null => {
		if (isKnownSeason(seasons, pickedSeasonId)) return pickedSeasonId;

		if (isKnownSeason(seasons, storedSeasonId)) return storedSeasonId;

		return defaultSeasonId;
	};
	const selectedSeasonId = resolveSelectedSeasonId();

	const handleSelectSeason = (id: string) => {
		setPickedSeasonId(id);
		localStorage.setItem(storageKey, id);
	};

	if (seasonsQuery.isError) {
		return (
			<DetailsSection title={m.player_seasons_and_episodes()} icon={Tv}>
				<AppErrorState
					title={m.web_seasons_fetch_failed()}
					description={m.web_check_connection()}
					error={seasonsQuery.error}
					onRetry={() => detach(seasonsQuery.refetch())}
				/>
			</DetailsSection>
		);
	}

	if (seasonsQuery.isLoading) {
		return (
			<DetailsSection title={m.player_seasons_and_episodes_caps()} icon={Tv}>
				<div className="space-y-6" role="status" aria-label={m.web_loading_seasons()}>
					<div className="flex gap-2">
						<Skeleton className="h-9 w-24 rounded-lg" />
						<Skeleton className="h-9 w-24 rounded-lg" />
					</div>
					<div className="space-y-3">
						<Skeleton className="h-24 w-full rounded-xl" />
						<Skeleton className="h-24 w-full rounded-xl" />
					</div>
				</div>
			</DetailsSection>
		);
	}

	if (seasons.length === 0) return null;

	return (
		<DetailsSection
			title={m.player_seasons_and_episodes_caps()}
			action={
				<h2 className="font-bold text-base text-foreground/45 sm:text-xl">
					{playback?.totalEpisodes ? `${playback.completedEpisodes}/${playback.totalEpisodes}` : undefined}
				</h2>
			}
			icon={Tv}
		>
			<div className="flex flex-col gap-8">
				{/* --- SEASON TABS WITH ARTWORK --- */}
				<ScrollArea className="w-full whitespace-nowrap">
					<div className="flex w-max gap-3 p-2">
						{seasons.map((season) => {
							const isSelected = season.id === selectedSeasonId;

							return (
								<Button
									type="button"
									variant={isSelected ? "default" : "ghost"}
									size="lg"
									key={season.id}
									onClick={() => handleSelectSeason(season.id)}
									className="min-w-20"
								>
									<span className="hidden md:inline">
										{season.seasonNumber === 0
											? m.components_special_episodes()
											: m.components_season_number_label({ number: season.seasonNumber })}
									</span>
									<span className="inline md:hidden">{season.seasonNumber === 0 ? "Spec" : `S${season.seasonNumber}`}</span>
								</Button>
							);
						})}
					</div>
					<ScrollBar orientation="horizontal" />
				</ScrollArea>

				<div aria-live="polite">
					<DetailsEpisodes metadataId={metadataId} seasonId={selectedSeasonId} playback={playback} isAdmin={isAdmin} />
				</div>
			</div>
		</DetailsSection>
	);
}
