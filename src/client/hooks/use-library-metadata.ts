import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { MetadataFilters, MetadataSorting, MetadataType, MetadataWithRelation, PaginatedResponse, RequireFields } from "@reelvault/sdk";
import { reelvault } from "../client";
import { metadataCardFields } from "../utils/fields";
import { genreKeys, metadataKeys } from "../utils/query-keys";

export type LibraryMetadataResponse = PaginatedResponse<RequireFields<MetadataWithRelation, typeof metadataCardFields>>;

export type UseLibraryMetadataInfiniteFilters = MetadataFilters & MetadataSorting;

export interface UseLibraryMetadataInfiniteOptions {
	limit?: number;
	filters?: UseLibraryMetadataInfiniteFilters;
	isForUI?: boolean;
}

/** Infinite-query options, exported so route loaders can prefetch page 1 into the same cache entry. */
export function libraryMetadataInfiniteQueryOptions(
	libraryId: string,
	type: MetadataType,
	options: UseLibraryMetadataInfiniteOptions = {},
) {
	const { limit = 40, filters = {}, isForUI = false } = options;

	return {
		queryKey: metadataKeys.library(libraryId, type, limit, filters, isForUI ? "ui" : "filtered"),
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

export function useLibraryMetadataInfinite(
	libraryId: string,
	type: MetadataType,
	initialData?: LibraryMetadataResponse,
	options: UseLibraryMetadataInfiniteOptions = {},
) {
	const initialPages =
		initialData && !Object.values(options.filters ?? {}).some(Boolean) ? { pages: [initialData], pageParams: [1] } : undefined;

	return useInfiniteQuery({
		...libraryMetadataInfiniteQueryOptions(libraryId, type, options),
		// Fresh prefetched pages land in the same cache entry, so this only
		// applies to explicitly provided initial data with no active filters.
		// The property must be absent (not merely undefined) while there is no
		// initial data: TanStack types `data` as non-nullable as soon as the
		// initialData property exists, which would hide the brief `undefined`
		// window while a new filter key is loading.
		...(initialPages !== undefined ? { initialData: initialPages } : {}),
	});
}

export function useLibraryGenres() {
	return useQuery({
		queryKey: genreKeys.list(),
		queryFn: () => reelvault.genres.getAll({ limit: 100, sortBy: "name", sortOrder: "asc" }),
		staleTime: 1000 * 60 * 10,
	});
}
