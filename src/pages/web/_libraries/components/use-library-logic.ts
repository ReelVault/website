import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Library, RequireFields } from "reelvault-sdk";
import { useLibraryGenres } from "@/client/hooks/use-library-metadata";
import { useDebounce } from "@/hooks/use-debounce";
import { detach } from "@/lib/detach";

const CURRENT_YEAR = new Date().getFullYear();

export type LibrarySortBy = "title" | "sortTitle" | "releaseDate" | "popularity" | "createdAt" | "updatedAt";

export type LibrarySortOrder = "asc" | "desc";

export type LibraryWatchedFilter = "all" | "watched" | "unwatched" | "in_progress";

export type LibraryRatingFilter = "all" | "liked" | "disliked" | "unrated";

const DURATION_SLIDER_MIN = 0;
const DURATION_SLIDER_MAX = 240;

const LIBRARY_SORT_BY_VALUES: readonly LibrarySortBy[] = ["title", "sortTitle", "releaseDate", "popularity", "createdAt", "updatedAt"];
const LIBRARY_WATCHED_VALUES: readonly LibraryWatchedFilter[] = ["all", "watched", "unwatched", "in_progress"];
const LIBRARY_RATING_VALUES: readonly LibraryRatingFilter[] = ["all", "liked", "disliked", "unrated"];

function isOneOf<T extends string>(values: readonly T[], value: string | null): value is T {
	return value !== null && (values as readonly string[]).includes(value);
}

function useLibrarySearchParams() {
	const { search } = useLocation();
	// The route validateSearch schemas keep these params as plain strings;
	// every consumer below re-validates before use.
	const params: Record<string, unknown> = search;
	const readString = (key: string): string | null => {
		const value = params[key];
		if (typeof value === "string") return value;

		if (value === null || value === undefined) return null;

		return typeof value === "number" || typeof value === "boolean" ? String(value) : null;
	};
	const readNumber = (key: string): number | null => {
		const raw = params[key];
		const value = Number(raw);

		return raw !== undefined && raw !== null && raw !== "" && Number.isFinite(value) ? value : null;
	};

	return { readString, readNumber };
}

interface LibraryFilterState {
	debouncedSearch: string;
	sortBy: LibrarySortBy;
	sortOrder: LibrarySortOrder;
	debouncedRange: [number, number];
	selectedGenresForFilter: string[];
	debouncedDurationRange: [number, number];
	watchedStatus: LibraryWatchedFilter;
	userRating: LibraryRatingFilter;
	isGenreMode: boolean;
	currentGenreIndex: number;
	letter: string;
}

const LIBRARY_LETTER_PATTERN = /^[A-Z#]$/;

// Library filters own their keys of the route's query string — every managed
// param is set or explicitly dropped (undefined); foreign params pass through.
function buildLibrarySearch<TSearch extends object>(
	prev: TSearch,
	filters: LibraryFilterState,
): TSearch & Record<string, string | undefined> {
	return {
		...prev,
		q: filters.debouncedSearch === "" ? undefined : filters.debouncedSearch,
		sortBy: filters.sortBy !== "title" ? filters.sortBy : undefined,
		sortOrder: filters.sortOrder !== "asc" ? filters.sortOrder : undefined,
		yearFrom: filters.debouncedRange[0] !== 1900 ? String(filters.debouncedRange[0]) : undefined,
		yearTo: filters.debouncedRange[1] !== CURRENT_YEAR ? String(filters.debouncedRange[1]) : undefined,
		genres: filters.selectedGenresForFilter.length > 0 ? filters.selectedGenresForFilter.join(",") : undefined,
		durationMin: filters.debouncedDurationRange[0] !== DURATION_SLIDER_MIN ? String(filters.debouncedDurationRange[0]) : undefined,
		durationMax: filters.debouncedDurationRange[1] !== DURATION_SLIDER_MAX ? String(filters.debouncedDurationRange[1]) : undefined,
		watched: filters.watchedStatus !== "all" ? filters.watchedStatus : undefined,
		rating: filters.userRating !== "all" ? filters.userRating : undefined,
		genreMode: filters.isGenreMode ? "true" : undefined,
		genreIndex: filters.isGenreMode && filters.currentGenreIndex > 0 ? String(filters.currentGenreIndex) : undefined,
		letter: filters.letter === "" ? undefined : filters.letter,
	};
}

export function useLibraryLogic(
	currentLibrary: RequireFields<Library, "id" | "type" | "name">,
	allLibraries: Array<RequireFields<Library, "id" | "name">>,
) {
	const navigate = useNavigate();
	const { readString, readNumber } = useLibrarySearchParams();

	const rawSortBy = readString("sortBy");
	const initialSortBy: LibrarySortBy = isOneOf(LIBRARY_SORT_BY_VALUES, rawSortBy) ? rawSortBy : "title";
	const rawSortOrder = readString("sortOrder");
	const initialSortOrder: LibrarySortOrder = rawSortOrder === "desc" ? "desc" : "asc";
	const rawWatched = readString("watched");
	const initialWatchedStatus: LibraryWatchedFilter = isOneOf(LIBRARY_WATCHED_VALUES, rawWatched) ? rawWatched : "all";
	const rawRating = readString("rating");
	const initialUserRating: LibraryRatingFilter = isOneOf(LIBRARY_RATING_VALUES, rawRating) ? rawRating : "all";
	const initialYearFrom = readNumber("yearFrom") ?? 1900;
	const initialYearTo = readNumber("yearTo") ?? new Date().getFullYear();
	const initialGenres = readString("genres")?.split(",") ?? [];
	const initialIsGenreMode = readString("genreMode") === "true";
	const rawGenreIndex = readNumber("genreIndex");
	const initialGenreIndex = rawGenreIndex !== null && Number.isInteger(rawGenreIndex) && rawGenreIndex >= 0 ? rawGenreIndex : 0;
	const initialDuration: [number, number] = [
		readNumber("durationMin") ?? DURATION_SLIDER_MIN,
		readNumber("durationMax") ?? DURATION_SLIDER_MAX,
	];
	const rawLetter = readString("letter");
	const initialLetter = rawLetter && LIBRARY_LETTER_PATTERN.test(rawLetter.toUpperCase()) ? rawLetter.toUpperCase() : "";

	const [searchTerm, setSearchTerm] = useState(() => readString("q") ?? "");
	const [range, setRange] = useState<[number, number]>([initialYearFrom, initialYearTo]);
	const [isGenreMode, setIsGenreMode] = useState(initialIsGenreMode);
	const [currentGenreIndex, setCurrentGenreIndex] = useState(initialGenreIndex);
	const [selectedGenresForFilter, setSelectedGenresForFilter] = useState<string[]>(initialGenres);
	const [sortBy, setSortBy] = useState<LibrarySortBy>(initialSortBy);
	const [sortOrder, setSortOrder] = useState<LibrarySortOrder>(initialSortOrder);
	const [durationRange, setDurationRange] = useState<[number, number]>(initialDuration);
	const [watchedStatus, setWatchedStatus] = useState<LibraryWatchedFilter>(initialWatchedStatus);
	const [userRating, setUserRating] = useState<LibraryRatingFilter>(initialUserRating);
	const [activeLetter, setActiveLetter] = useState(initialLetter);

	const debouncedSearch = useDebounce({ value: searchTerm, delay: 300 });
	const debouncedRange = useDebounce({ value: range, delay: 300 });
	const debouncedDurationRange = useDebounce({ value: durationRange, delay: 300 });
	const genresQuery = useLibraryGenres();
	const availableGenres = genresQuery.data?.data ?? [];
	const activeGenreId = isGenreMode && availableGenres.length > 0 ? availableGenres[currentGenreIndex]?.id : undefined;

	useEffect(() => {
		// Library filters own their keys of the route's query string — every managed
		// param is set or explicitly dropped (undefined); foreign params pass through.
		// viewTransition off: filter typing must not cross-fade.
		detach(
			navigate({
				// "." keeps the shared hook on whichever library route (/movies, /series)
				// is current, so search is typed against that route's filter schema.
				to: ".",
				search: (prev) =>
					buildLibrarySearch(prev, {
						debouncedSearch,
						sortBy,
						sortOrder,
						debouncedRange,
						selectedGenresForFilter,
						debouncedDurationRange,
						watchedStatus,
						userRating,
						isGenreMode,
						currentGenreIndex,
						letter: activeLetter,
					}),
				replace: true,
				viewTransition: false,
			}),
		);
	}, [
		debouncedSearch,
		sortBy,
		sortOrder,
		debouncedRange,
		selectedGenresForFilter,
		debouncedDurationRange,
		watchedStatus,
		userRating,
		isGenreMode,
		currentGenreIndex,
		activeLetter,
		navigate,
	]);

	const filters = {
		title: debouncedSearch || undefined,
		startsWith: activeLetter || undefined,
		yearFrom: debouncedRange[0] !== 1900 ? debouncedRange[0] : undefined,
		yearTo: debouncedRange[1] !== CURRENT_YEAR ? debouncedRange[1] : undefined,
		genreIds: activeGenreId ?? (selectedGenresForFilter.length > 0 ? selectedGenresForFilter.join(",") : undefined),
		minDurationMinutes: debouncedDurationRange[0] !== DURATION_SLIDER_MIN ? debouncedDurationRange[0] : undefined,
		maxDurationMinutes: debouncedDurationRange[1] !== DURATION_SLIDER_MAX ? debouncedDurationRange[1] : undefined,
		watchedStatus: watchedStatus !== "all" ? watchedStatus : undefined,
		userRating: userRating !== "all" ? userRating : undefined,
		sortBy,
		sortOrder,
	};

	const currentIndex = allLibraries.findIndex((library) => library.id === currentLibrary.id);
	const { prevLib, nextLib } =
		allLibraries.length <= 1 || currentIndex < 0
			? { nextLib: undefined, prevLib: undefined }
			: {
					prevLib: allLibraries[(currentIndex - 1 + allLibraries.length) % allLibraries.length],
					nextLib: allLibraries[(currentIndex + 1) % allLibraries.length],
				};

	const nextGenre = () => setCurrentGenreIndex((previous) => (previous + 1) % Math.max(availableGenres.length, 1));
	const prevGenre = () => setCurrentGenreIndex((previous) => (previous - 1 + availableGenres.length) % Math.max(availableGenres.length, 1));

	return {
		state: {
			searchTerm,
			range,
			isGenreMode,
			currentGenreIndex,
			selectedGenresForFilter,
			sortBy,
			sortOrder,
			durationRange,
			watchedStatus,
			userRating,
			activeLetter,
		},
		filters,
		actions: {
			setSearchTerm,
			setRange,
			setIsGenreMode,
			setSelectedGenresForFilter,
			setSortBy,
			setSortOrder,
			setDurationRange,
			setWatchedStatus,
			setUserRating,
			setActiveLetter,
			nextGenre,
			prevGenre,
		},
		data: {
			activeGenre: isGenreMode ? availableGenres[currentGenreIndex] : null,
			prevLib,
			nextLib,
			availableGenres,
			yearRange: { min: 1900, max: CURRENT_YEAR },
			durationRange: { min: DURATION_SLIDER_MIN, max: DURATION_SLIDER_MAX },
		},
	};
}
