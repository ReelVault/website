import type { Library, MetadataType, RequireFields } from "@reelvault/sdk";
import type { InfiniteData } from "@tanstack/react-query";
import { addTransitionType, startTransition, useEffect, useRef, useState, ViewTransition } from "react";
import {
	type LibraryMetadataResponse,
	type UseLibraryMetadataInfiniteFilters,
	useLibraryMetadataInfinite,
} from "@/client/hooks/use-library-metadata";
import { AppErrorState } from "@/components/app-states";
import { Skeleton } from "@/components/ui/skeleton";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { runTransition } from "@/utils/view-transitions";
import { LibraryAlphabetNavigation } from "./library-alphabet-navigation";
import { LibraryContentGrid } from "./library-content-grid";
import { LibraryFilterSection } from "./library-filter-section";
import { LibraryFloatingInfo } from "./library-floating-info";
import { LibraryHero } from "./library-hero";
import { useLibraryLogic } from "./use-library-logic";

function LibraryInfiniteContent({
	libraryId,
	libraryName,
	availableGenresLength,
	type,
	initialData,
	filters,
	onTotalItemsChange,
}: {
	libraryId: string;
	libraryName: string;
	availableGenresLength: number;
	type: MetadataType;
	initialData?: LibraryMetadataResponse;
	filters: UseLibraryMetadataInfiniteFilters;
	onTotalItemsChange?: (total: number) => void;
}) {
	const queryResult = useLibraryMetadataInfinite(libraryId, type, initialData, {
		limit: 40,
		filters,
	});

	const totalCount = queryResult.data?.pages[0]?.total ?? 0;

	let filteredMetadataLength = 0;
	if (queryResult.data) {
		for (const page of queryResult.data.pages) {
			filteredMetadataLength += page.data.length;
		}
	}

	// Render data is held in state: when filters change (new queryKey, data
	// briefly undefined) the old grid stays on screen and the fresh result is
	// commitowany w Transition z typem "filter" — ViewTransition robi cross-fade.
	// Appending a page (infinite scroll) goes in directly, without animation.
	// We keep the response object in state (react-query preserves reference identity
	// via structural sharing) so the effect compares references, not flattened
	// arrays (each flatMap is a new array = infinite setState loop).
	const [displayData, setDisplayData] = useState<InfiniteData<LibraryMetadataResponse> | undefined>(queryResult.data);
	const displayMetadata = displayData?.pages.flatMap((page) => page.data) ?? [];
	const pendingFilterCommit = useRef(false);

	useEffect(() => {
		const fresh = queryResult.data;
		if (!fresh) {
			if (displayData) pendingFilterCommit.current = true;

			return;
		}

		if (pendingFilterCommit.current) {
			pendingFilterCommit.current = false;
			startTransition(() => {
				addTransitionType("filter");
				setDisplayData(fresh);
			});

			return;
		}

		if (fresh !== displayData) setDisplayData(fresh);
	}, [queryResult.data, displayData]);

	useEffect(() => {
		onTotalItemsChange?.(totalCount);
	}, [totalCount, onTotalItemsChange]);

	// First load (no data at all) → skeleton; when filters change
	// the old grid stays on screen until the fresh data commits.
	if (queryResult.isPending && displayMetadata.length === 0) return <GridSkeleton />;

	if (queryResult.isError) {
		return (
			<div className="cinema-shell py-16">
				<AppErrorState
					title={m.web_library_contents_fetch_failed()}
					description={m.web_check_connection()}
					error={queryResult.error}
					onRetry={() => {
						detach(queryResult.refetch());
					}}
				/>
			</div>
		);
	}

	return (
		<>
			<ViewTransition update={{ default: "none", filter: "auto" }}>
				<LibraryContentGrid
					validMetadata={displayMetadata}
					isLoadingMore={queryResult.isFetchingNextPage}
					hasNextPage={queryResult.hasNextPage}
					onLoadMore={() => {
						detach(queryResult.fetchNextPage());
					}}
				/>
			</ViewTransition>
			<LibraryFloatingInfo
				currentLibraryName={libraryName}
				validMetadataLength={filteredMetadataLength}
				availableGenresLength={availableGenresLength}
			/>
		</>
	);
}

const SKELETON_PLACEHOLDERS = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"] as const;

function GridSkeleton() {
	return (
		<div className="cinema-shell py-10" aria-busy="true">
			<div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
				{SKELETON_PLACEHOLDERS.map((placeholder) => (
					<div key={placeholder} className="flex flex-col gap-3">
						<Skeleton className="aspect-2/3 w-full rounded-xl" />
						<Skeleton className="h-4 w-3/4" />
					</div>
				))}
			</div>
		</div>
	);
}

export function LibraryLayout({
	currentLibrary,
	allLibraries,
	initialData,
}: {
	currentLibrary: RequireFields<Library, "id" | "type" | "name">;
	allLibraries: Array<RequireFields<Library, "id" | "name">>;
	initialData?: LibraryMetadataResponse;
}) {
	const { state, actions, data, filters } = useLibraryLogic(currentLibrary, allLibraries);
	const [totalItems, setTotalItems] = useState(0);

	const availableGenreNames = data.availableGenres.map((g) => g.name);

	return (
		<div className="min-h-screen bg-background">
			<LibraryHero
				currentLibrary={currentLibrary}
				isGenreMode={state.isGenreMode}
				setIsGenreMode={actions.setIsGenreMode}
				availableGenres={availableGenreNames}
				currentGenreIndex={state.currentGenreIndex}
				activeGenre={data.activeGenre?.name}
				prevLib={data.prevLib}
				nextLib={data.nextLib}
				prevGenre={actions.prevGenre}
				nextGenre={actions.nextGenre}
				validMetadataLength={totalItems}
			/>

			<LibraryFilterSection
				searchTerm={state.searchTerm}
				setSearchTerm={(value) => runTransition("filter", () => actions.setSearchTerm(value))}
				range={state.range}
				setRange={(value) => runTransition("filter", () => actions.setRange(value))}
				yearRange={data.yearRange}
				sortBy={state.sortBy}
				setSortBy={(value) => runTransition("filter", () => actions.setSortBy(value))}
				sortOrder={state.sortOrder}
				setSortOrder={(value) => runTransition("filter", () => actions.setSortOrder(value))}
				durationRange={state.durationRange}
				setDurationRange={(value) => runTransition("filter", () => actions.setDurationRange(value))}
				durationBounds={data.durationRange}
				watchedStatus={state.watchedStatus}
				setWatchedStatus={(value) => runTransition("filter", () => actions.setWatchedStatus(value))}
				userRating={state.userRating}
				setUserRating={(value) => runTransition("filter", () => actions.setUserRating(value))}
			/>

			<LibraryInfiniteContent
				libraryId={currentLibrary.id}
				libraryName={currentLibrary.name}
				availableGenresLength={availableGenreNames.length}
				type={currentLibrary.type === "movies" ? "movie" : "tv_show"}
				initialData={initialData}
				filters={filters}
				onTotalItemsChange={setTotalItems}
			/>

			<LibraryAlphabetNavigation
				activeLetter={state.activeLetter}
				onSelectLetter={(letter) => runTransition("filter", () => actions.setActiveLetter(letter))}
			/>
		</div>
	);
}
