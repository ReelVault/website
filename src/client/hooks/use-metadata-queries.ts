import { queryOptions, useQuery } from "@tanstack/react-query";
import type { MetadataSorting, MetadataType } from "@reelvault/sdk";
import { reelvault } from "../client";
import { metadataCardFields, metadataDetailsFields, metadataInfoFields, metadataRecentlyAddedFields } from "../utils/fields";
import { metadataKeys } from "../utils/query-keys";

export function useMetadata(metadataId: string) {
	return useQuery({
		queryKey: metadataKeys.byId(metadataId),
		queryFn: () => reelvault.metadata.getById(metadataId, { fields: metadataDetailsFields }),
		enabled: Boolean(metadataId),
		staleTime: Number.POSITIVE_INFINITY,
	});
}

/**
 * Composite details payload (metadata, media files, seasons, user state,
 * smart play, similar) — one server round-trip for the whole details screen.
 * Sections share this query via the same key, so it fires exactly once.
 */
export const detailsViewQueryOptions = (id: string) =>
	queryOptions({
		queryKey: metadataKeys.detailsView(id),
		queryFn: () => reelvault.metadata.getDetailsView(id),
		staleTime: 30_000,
	});

export function useDetailsView(id: string) {
	return useQuery({ ...detailsViewQueryOptions(id), enabled: Boolean(id) });
}

export function useMetadataRelated(metadataId: string, options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: metadataKeys.related(metadataId),
		queryFn: () => reelvault.metadata.getSimilar(metadataId, { fields: metadataCardFields }),
		enabled: (options?.enabled ?? true) && Boolean(metadataId),
		staleTime: 1000 * 60 * 60,
	});
}

export function useMetadataWatchlist(metadataIds: readonly string[]) {
	const normalizedMetadataIds = metadataIds.toSorted();

	return useQuery({
		queryKey: metadataKeys.watchlist(normalizedMetadataIds),
		queryFn: () =>
			normalizedMetadataIds.length > 0
				? reelvault.metadata.getAll({ metadataIds: normalizedMetadataIds.join(","), fields: metadataCardFields })
				: Promise.resolve({ data: [], total: 0, page: 1, limit: 0, totalPages: 0 }),
		staleTime: 1000 * 60 * 5,
	});
}

export function useMetadataSimilarByActor(actorId?: string, options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: metadataKeys.similarByActor(actorId),
		queryFn: () =>
			actorId
				? reelvault.metadata.getAll({
						castIds: actorId,
						fields: metadataCardFields,
						sortBy: "castOrder",
						sortOrder: "asc",
					})
				: Promise.resolve({ data: [], total: 0, page: 1, limit: 0, totalPages: 0 }),
		enabled: (options?.enabled ?? true) && Boolean(actorId),
		staleTime: 1000 * 60 * 60,
	});
}

export const metadataCollectionQueryOptions = (
	collectionId?: string,
	sort?: { sortBy?: NonNullable<MetadataSorting["sortBy"]>; sortOrder?: "asc" | "desc" },
) => {
	const sortBy = sort?.sortBy ?? "releaseDate";
	const sortOrder = sort?.sortOrder ?? "asc";

	return queryOptions({
		queryKey: metadataKeys.collection(collectionId, sortBy, sortOrder),
		queryFn: () =>
			reelvault.metadata.getAll({
				collectionIds: collectionId,
				fields: metadataInfoFields,
				sortBy,
				sortOrder,
			}),
		enabled: Boolean(collectionId),
		staleTime: 1000 * 60 * 60,
	});
};

export function useMetadataCollection(
	collectionId?: string,
	sort?: { sortBy?: NonNullable<MetadataSorting["sortBy"]>; sortOrder?: "asc" | "desc" },
	options?: { enabled?: boolean },
) {
	return useQuery({
		...metadataCollectionQueryOptions(collectionId, sort),
		enabled: (options?.enabled ?? true) && Boolean(collectionId),
	});
}

export const metadataPersonQueryOptions = (personId: string) =>
	queryOptions({
		queryKey: metadataKeys.person(personId),
		queryFn: () =>
			reelvault.metadata.getAll({
				personIds: personId,
				fields: metadataCardFields,
				sortBy: "releaseDate",
				sortOrder: "desc",
				limit: 100,
			}),
		enabled: Boolean(personId),
		staleTime: 1000 * 60 * 60,
	});

export function useMetadataPerson(personId: string) {
	return useQuery(metadataPersonQueryOptions(personId));
}

export const metadataPopularQueryOptions = (limit = 10) =>
	queryOptions({
		queryKey: metadataKeys.popular(limit),
		queryFn: () =>
			reelvault.metadata.getAll({
				fields: metadataInfoFields,
				sortBy: "popularity",
				sortOrder: "desc",
				limit,
			}),
		staleTime: 1000 * 60 * 5,
	});

export function useMetadataPopular(limit = 10) {
	return useQuery(metadataPopularQueryOptions(limit));
}

export function useMetadataRecentlyAdded(limit = 10, type?: MetadataType, options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: metadataKeys.recentlyAdded(limit, type),
		queryFn: () =>
			reelvault.metadata.getAll({
				fields: metadataRecentlyAddedFields,
				sortBy: "createdAt",
				sortOrder: "desc",
				limit,
				type,
			}),
		enabled: options?.enabled ?? true,
		staleTime: 1000 * 60 * 5,
	});
}
