import { useQuery } from "@tanstack/react-query";
import { reelvault } from "../client";
import { providersKeys } from "../utils/query-keys";

const emptyToUndefined = (value: string | undefined): string | undefined => (value === "" ? undefined : value);

export function useProviderSearch(options: {
	mediaType: "movie" | "tv_show";
	title: string;
	year?: number | undefined;
	providerId?: string | undefined;
	externalId?: string | undefined;
	enabled?: boolean;
}) {
	const { mediaType, title, year, providerId, externalId, enabled = true } = options;

	return useQuery({
		queryKey: providersKeys.search(mediaType, { title, year, providerId, externalId }),
		// Omit empty fields — the server switches between title and id modes on
		// what is actually present in the body.
		queryFn: () =>
			reelvault.providers.search({
				type: mediaType,
				title: emptyToUndefined(title.trim()),
				year,
				providerId: emptyToUndefined(providerId),
				externalId: emptyToUndefined(externalId?.trim()),
			}),
		enabled: Boolean(title.trim() || (providerId && externalId)) && enabled,
		staleTime: 1000 * 60 * 5,
	});
}

/** Providers with their enabled flag — the identify-by-id dialog lets the user pick one explicitly. */
export function useProviderConfigurations() {
	return useQuery({
		queryKey: providersKeys.configurations(),
		queryFn: () => reelvault.providers.getConfigurations(),
		staleTime: 1000 * 60 * 5,
	});
}

/** Flatten provider search results groups into a flat list with providerId. */
export function flattenProviderSearchResults<T extends object>(
	groups?: Array<{ providerId: string; results: T[] }> | null,
): Array<T & { providerId: string }> {
	if (!groups || groups.length === 0) return [];

	const flattened: Array<T & { providerId: string }> = [];
	for (const group of groups) {
		for (const item of group.results) {
			flattened.push({ ...item, providerId: group.providerId });
		}
	}

	return flattened;
}
