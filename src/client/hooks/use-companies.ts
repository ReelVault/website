import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query";
import { reelvault } from "../client";
import { companyListFields, metadataCardFields } from "../utils/fields";
import { companyKeys } from "../utils/query-keys";

export const companiesListQueryOptions = () =>
	queryOptions({
		queryKey: companyKeys.list(),
		queryFn: () => reelvault.companies.getAll({ limit: 100, sortBy: "name", fields: companyListFields }),
		staleTime: 1000 * 60 * 10,
	});

export function useCompanies() {
	return useQuery(companiesListQueryOptions());
}

export const companyDetailsQueryOptions = (id: string) =>
	queryOptions({
		queryKey: companyKeys.detail(id),
		queryFn: () => reelvault.companies.getById(id, { fields: companyListFields }),
		staleTime: 600_000,
	});

export function useCompanyDetails(id: string, page = 1, limit = 24) {
	const companyQuery = useQuery({
		...companyDetailsQueryOptions(id),
		enabled: Boolean(id),
	});
	const metadataQuery = useQuery({
		queryKey: companyKeys.metadata(id, { page, limit }),
		queryFn: () => reelvault.metadata.getAll({ companyIds: id, fields: metadataCardFields, page, limit }),
		staleTime: 600_000,
		enabled: Boolean(id),
		placeholderData: keepPreviousData,
	});
	const metadata = metadataQuery.data?.data ?? [];
	const total = metadataQuery.data?.total ?? 0;
	const totalPages = metadataQuery.data?.totalPages ?? 1;

	return {
		companyQuery,
		metadataQuery,
		titlesQuery: metadataQuery,
		titles: metadata,
		metadata,
		total,
		totalPages,
	};
}
