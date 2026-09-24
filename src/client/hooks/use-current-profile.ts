import { ReelVaultError } from "@reelvault/sdk/client";
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
	// A signed-out visitor produces a 401 by design — retrying only doubles the
	// console noise (and the load) for an answer that will not change.
	retry: (failureCount: number, error: unknown): boolean => {
		if (error instanceof ReelVaultError && error.status === 401) return false;

		return failureCount < 1;
	},
});

function useCurrentProfile(enabled = true) {
	return useQuery({ ...currentProfileQueryOptions(), enabled });
}

export function useCurrentUser(options?: { enabled?: boolean }) {
	const query = useCurrentProfile(options?.enabled ?? true);

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
