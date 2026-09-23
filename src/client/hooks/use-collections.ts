import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query";
import { reelvault } from "../client";
import { collectionListFields } from "../utils/fields";
import { collectionKeys } from "../utils/query-keys";

export const collectionsPageQueryOptions = (page: number, limit = 12) => ({
	queryKey: collectionKeys.page(page, limit),
	queryFn: async () =>
		await reelvault.collections.getAll({
			page,
			limit,
			fields: collectionListFields,
		}),
	staleTime: 1000 * 60 * 120,
	placeholderData: keepPreviousData,
});

export function useCollections(page: number, limit = 12) {
	return useQuery(collectionsPageQueryOptions(page, limit));
}

export const collectionDetailsQueryOptions = (id: string) =>
	queryOptions({
		queryKey: collectionKeys.detail(id),
		queryFn: () => reelvault.collections.getById(id, { fields: collectionListFields }),
		enabled: Boolean(id),
		staleTime: 1000 * 60 * 120,
	});

export function useCollectionDetails(id: string, options?: { enabled?: boolean }) {
	return useQuery({
		...collectionDetailsQueryOptions(id),
		enabled: (options?.enabled ?? true) && Boolean(id),
	});
}
