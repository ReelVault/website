import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { reelvault } from "../client";
import { adminKeys } from "../utils/query-keys";

export function useAdminKeywords(search?: string, page = 1, limit = 50) {
	const query = useQuery({
		queryKey: adminKeys.keywords(search, { page, limit }),
		placeholderData: keepPreviousData,
		queryFn: () => reelvault.keywords.getAll({ limit, page, name: search === "" ? undefined : search }),
		staleTime: 120_000,
	});

	return {
		keywords: query.data?.data ?? [],
		total: query.data?.total ?? 0,
		totalPages: query.data?.totalPages ?? 1,
		isLoading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}
