import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { reelvault } from "../client";
import { companyListFields } from "../utils/fields";
import { adminKeys } from "../utils/query-keys";

export function useAdminCompanies(search?: string, page = 1, limit = 48) {
	const query = useQuery({
		queryKey: adminKeys.companies(search, { page, limit }),
		placeholderData: keepPreviousData,
		queryFn: () =>
			reelvault.companies.getAll({ limit, page, sortBy: "name", name: search === "" ? undefined : search, fields: companyListFields }),
		staleTime: 120_000,
	});

	return {
		companies: query.data?.data ?? [],
		total: query.data?.total ?? 0,
		totalPages: query.data?.totalPages ?? 1,
		isLoading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}
