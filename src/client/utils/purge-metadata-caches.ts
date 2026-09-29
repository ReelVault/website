import type { QueryClient } from "@tanstack/react-query";
import { metadataKeys } from "./query-keys";

/**
 * Drops every cached metadata shape for one id after a delete. The three
 * caches (byId / details / detailsView) used to be purged inline — copy-pasted
 * in the editor and the admin table with the exact same key set.
 */
export function purgeMetadataCaches(queryClient: QueryClient, metadataId: string): void {
	queryClient.removeQueries({ queryKey: metadataKeys.byId(metadataId) });
	queryClient.removeQueries({ queryKey: metadataKeys.details(metadataId) });
	queryClient.removeQueries({ queryKey: metadataKeys.detailsView(metadataId) });
}
