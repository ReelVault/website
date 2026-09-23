import { useQuery } from "@tanstack/react-query";
import { reelvault } from "../client";
import { seasonFields } from "../utils/fields";
import { seasonKeys } from "../utils/query-keys";

export function useSeasons(metadataId: string) {
	return useQuery({
		queryKey: seasonKeys.byMetadata(metadataId),
		queryFn: () => reelvault.seasons.getAll({ metadataId, fields: seasonFields }),
		// Empty id = caller intentionally opted out (e.g. movies) — no request.
		enabled: metadataId !== "",
		staleTime: 1000 * 60 * 60 * 24,
	});
}
