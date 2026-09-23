import { useQuery } from "@tanstack/react-query";
import { reelvault } from "../client";
import { authKeys } from "../utils/query-keys";

/**
 * Shared query options so non-hook callers (router `beforeLoad` guards) resolve
 * the exact same cache entry as `useCurrentUser`.
 */
export const currentProfileQueryOptions = () => ({
	queryKey: authKeys.me(),
	queryFn: async () => {
		const result = await reelvault.me.get();

		return result;
	},
	staleTime: 300_000,
});

function useCurrentProfile() {
	return useQuery(currentProfileQueryOptions());
}

export function useCurrentUser() {
	const query = useCurrentProfile();

	return {
		user: query.data?.user ?? null,
		profile: query.data?.profile ?? null,
		isLoading: query.isLoading,
		isFetching: query.isFetching,
		isAuthenticated: !!query.data?.user,
	};
}

export function useIsAdmin(): boolean {
	const query = useCurrentProfile();

	return query.data?.user?.role === "admin";
}
