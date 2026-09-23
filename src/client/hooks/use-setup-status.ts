import { useQuery } from "@tanstack/react-query";
import { reelvault } from "../client";
import { setupKeys } from "../utils/query-keys";

export function useSetupStatus() {
	return useQuery({
		queryKey: setupKeys.status(),
		queryFn: async () => {
			const result = await reelvault.setup.getStatus();

			return result;
		},
		staleTime: 60_000,
	});
}

export function useIsSetupRequired() {
	const query = useSetupStatus();

	return {
		isLoading: query.isLoading,
		isError: query.isError,
		isRequired: query.data?.required ?? true,
		// Defaults to false so a default home server (token mode off) never sees
		// the token step, even during the initial fetch.
		tokenRequired: query.data?.tokenRequired ?? false,
		isReady: query.data?.required === false,
		refetch: query.refetch,
	};
}
