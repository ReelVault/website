import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useDebounce } from "../../hooks/use-debounce";
import { reelvault } from "../client";
import { metadataKeys } from "../utils/query-keys";

interface GlobalMetadataSearchOptions {
	/** Controlled query text — when omitted the hook owns its input state. */
	query?: string;
	debounceDelay?: number;
	limit?: number;
}

export function useGlobalMetadataSearch(options?: GlobalMetadataSearchOptions) {
	const [internalQuery, setInternalQuery] = useState("");
	const query = options?.query ?? internalQuery;
	const debouncedQuery = useDebounce({ value: query, delay: options?.debounceDelay ?? 500 });
	const metadataQuery = useQuery({
		queryKey: metadataKeys.search(debouncedQuery),
		placeholderData: keepPreviousData,
		queryFn: () => reelvault.metadata.searchGlobal(debouncedQuery, options?.limit ?? 20),
		enabled: debouncedQuery.length >= 2,
		staleTime: 300_000,
	});
	const results = metadataQuery.data ?? { titles: [], people: [], collections: [], genres: [] };
	const hasResults = results.titles.length + results.people.length + results.collections.length + results.genres.length > 0;

	return {
		query,
		setQuery: setInternalQuery,
		results,
		isLoading: metadataQuery.isLoading,
		isFetching: metadataQuery.isFetching,
		isError: metadataQuery.isError,
		hasResults,
	};
}
