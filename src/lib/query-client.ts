import { QueryClient } from "@tanstack/react-query";

export function createQueryClient(): QueryClient {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60 * 1000,
				gcTime: 10 * 60 * 1000,
				refetchOnWindowFocus: false,
				retry: 1,
				networkMode: "offlineFirst",
			},
			mutations: {
				networkMode: "offlineFirst",
			},
		},
	});
}

export const queryClient = createQueryClient();
