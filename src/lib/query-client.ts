import { ReelVaultError } from "@reelvault/sdk/client";
import { QueryClient } from "@tanstack/react-query";

/**
 * React Query retries only what the SDK deems worth retrying. The SDK already
 * attempted transient failures (network/timeout/5xx/429) with backoff, so a
 * non-retryable `ReelVaultError` (4xx such as 403/404/validation) must settle
 * immediately instead of issuing another doomed request. Everything else retries
 * once at this layer.
 */
function retryQuery(failureCount: number, error: unknown): boolean {
	if (error instanceof ReelVaultError && !error.retryable) return false;

	return failureCount < 1;
}

export function createQueryClient(): QueryClient {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60 * 1000,
				gcTime: 10 * 60 * 1000,
				refetchOnWindowFocus: false,
				retry: retryQuery,
				networkMode: "offlineFirst",
			},
			mutations: {
				networkMode: "offlineFirst",
			},
		},
	});
}

export const queryClient = createQueryClient();
