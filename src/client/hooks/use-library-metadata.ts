import type {
	MetadataFilters,
	MetadataSorting,
	MetadataType,
	MetadataWithRelation,
	PaginatedResponse,
	RequireFields,
} from "@reelvault/sdk";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { reelvault } from "../client";
import { metadataCardFields } from "../utils/fields";
import { genreKeys, metadataKeys } from "../utils/query-keys";

export type LibraryMetadataResponse = PaginatedResponse<RequireFields<MetadataWithRelation, typeof metadataCardFields>>;

export type UseLibraryMetadataInfiniteFilters = MetadataFilters & MetadataSorting;

export interface UseLibraryMetadataInfiniteOptions {
	limit?: number;
	filters?: UseLibraryMetadataInfiniteFilters;
}

/** The filters an unfiltered library view sends; the route loaders prefetch page 1 under this key. */
export const DEFAULT_LIBRARY_FILTERS: UseLibraryMetadataInfiniteFilters = { sortBy: "title", sortOrder: "asc" };

/** Infinite-query options, exported so route loaders can prefetch page 1 into the same cache entry. */
export function libraryMetadataInfiniteQueryOptions(
	libraryId: string,
	type: MetadataType,
	options: UseLibraryMetadataInfiniteOptions = {},
) {
	const { limit = 40, filters = DEFAULT_LIBRARY_FILTERS } = options;

	return {
		queryKey: metadataKeys.library(libraryId, type, limit, filters),
		queryFn: async ({ pageParam }: { pageParam: number }) => {
			const response = await reelvault.metadata.getAll({
				fields: metadataCardFields,
				page: pageParam,
				limit,
				type,
				libraryIds: libraryId,
				title: filters.title,
				startsWith: filters.startsWith,
				yearFrom: filters.yearFrom,
				yearTo: filters.yearTo,
				genreIds: filters.genreIds,
				minDurationMinutes: filters.minDurationMinutes,
				maxDurationMinutes: filters.maxDurationMinutes,
				watchedStatus: filters.watchedStatus,
				userRating: filters.userRating,
				sortBy: filters.sortBy,
				sortOrder: filters.sortOrder,
			});

			return response;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage: LibraryMetadataResponse) => (lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined),
		maxPages: 5,
		staleTime: 1000 * 60 * 5,
	};
}

export function useLibraryMetadataInfinite(libraryId: string, type: MetadataType, options: UseLibraryMetadataInfiniteOptions = {}) {
	return useInfiniteQuery(libraryMetadataInfiniteQueryOptions(libraryId, type, options));
}

export function useLibraryGenres() {
	return useQuery({
		queryKey: genreKeys.list(),
		queryFn: () => reelvault.genres.getAll({ limit: 100, sortBy: "name", sortOrder: "asc" }),
		staleTime: 1000 * 60 * 10,
	});
}
