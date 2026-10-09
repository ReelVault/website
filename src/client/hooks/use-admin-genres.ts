import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { reelvault } from "../client";
import { adminKeys } from "../utils/query-keys";

const GENRES_PAGE_SIZE = 50;

export function useAdminGenres(search: string | undefined, page: number) {
	const query = useQuery({
		queryKey: adminKeys.genres(search, { page, limit: GENRES_PAGE_SIZE }),
		placeholderData: keepPreviousData,
		queryFn: () => reelvault.genres.getAll({ page, limit: GENRES_PAGE_SIZE, name: search === "" ? undefined : search }),
		staleTime: 120_000,
	});

	return {
		genres: query.data?.data ?? [],
		total: query.data?.total ?? 0,
		totalPages: query.data?.totalPages ?? 0,
		isLoading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}
