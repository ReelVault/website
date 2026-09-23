import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { reelvault } from "../client";
import { personAdminFields } from "../utils/fields";
import { adminKeys } from "../utils/query-keys";

export function useAdminPeople(search?: string, page = 1, limit = 48) {
	const query = useQuery({
		queryKey: adminKeys.people(search, { page, limit }),
		placeholderData: keepPreviousData,
		queryFn: () => reelvault.people.getAll({ limit, page, name: search === "" ? undefined : search, fields: personAdminFields }),
		staleTime: 120_000,
	});

	return {
		people: query.data?.data ?? [],
		total: query.data?.total ?? 0,
		totalPages: query.data?.totalPages ?? 1,
		isLoading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}
