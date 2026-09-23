import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query";
import { reelvault } from "../client";
import { metadataCardFields } from "../utils/fields";
import { genreKeys, keywordKeys } from "../utils/query-keys";

const taxonomyListFields = "id,name" as const;

export type TaxonomyDetailsKind = "genre" | "keyword";

export function taxonomyDetailsQueryOptions(kind: TaxonomyDetailsKind, id: string) {
	return queryOptions({
		queryKey: kind === "genre" ? genreKeys.detail(id) : keywordKeys.detail(id),
		queryFn: () =>
			kind === "genre"
				? reelvault.genres.getById(id, { fields: taxonomyListFields })
				: reelvault.keywords.getById(id, { fields: taxonomyListFields }),
		enabled: Boolean(id),
		staleTime: 600_000,
	});
}

/** Shared genre / keyword details hook: entity + paginated titles. */
export function useTaxonomyDetails(kind: TaxonomyDetailsKind, id: string, page = 1, limit = 24) {
	const taxonomyQuery = useQuery(taxonomyDetailsQueryOptions(kind, id));
	const metadataQuery = useQuery({
		queryKey: kind === "genre" ? genreKeys.metadata(id, { page, limit }) : keywordKeys.metadata(id, { page, limit }),
		placeholderData: keepPreviousData,
		queryFn: () => {
			const filter = kind === "genre" ? { genreIds: id } : { keywordIds: id };

			return reelvault.metadata.getAll({ ...filter, fields: metadataCardFields, page, limit });
		},
		staleTime: 600_000,
		enabled: Boolean(id),
	});
	const metadata = metadataQuery.data?.data ?? [];
	const total = metadataQuery.data?.total ?? 0;
	const totalPages = metadataQuery.data?.totalPages ?? 1;

	return {
		taxonomyQuery,
		metadataQuery,
		metadata,
		total,
		totalPages,
	};
}
