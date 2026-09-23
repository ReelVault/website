import { queryOptions, useQuery } from "@tanstack/react-query";
import { reelvault } from "../client";
import { discoveryKeys } from "../utils/query-keys";

export const discoveryQueryOptions = () =>
	queryOptions({
		queryKey: discoveryKeys.view(),
		queryFn: () => reelvault.discover.getDiscoverView({ limit: 12 }),
		staleTime: 60_000,
	});

export function useDiscovery() {
	const discoverQuery = useQuery(discoveryQueryOptions());
	const discoverView = discoverQuery.data;
	const discoveryItems = discoverView
		? [...discoverView.recommendations, ...discoverView.trending, ...discoverView.recentlyAddedMovies, ...discoverView.recentlyAddedShows]
		: [];

	return {
		discoverQuery,
		discoverView,
		discoveryItems,
	};
}
