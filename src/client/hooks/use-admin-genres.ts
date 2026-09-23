import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { reelvault } from "../client";
import { adminKeys } from "../utils/query-keys";

export function useAdminGenres(search?: string) {
	const query = useQuery({
		queryKey: adminKeys.genres(search),
		placeholderData: keepPreviousData,
		queryFn: () => reelvault.genres.getAll({ limit: 100, name: search === "" ? undefined : search }),
		staleTime: 120_000,
	});

	return {
		genres: query.data?.data ?? [],
		total: query.data?.total ?? 0,
		isLoading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}
