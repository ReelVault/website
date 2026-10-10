import type { MediaFileWithRelation } from "@reelvault/sdk";
import { useQuery } from "@tanstack/react-query";
import { startTransition, useState } from "react";
import { reelvault } from "@/client/client";
import { mediaKeys } from "@/client/utils/query-keys";

interface UseMediaFilesOptions {
	metadataId?: string;
	episodeId?: string;
	enabled: boolean;
}

/** Keeps a file when the query matches its name, path, edition, quality tag or source. */
function filterMediaFiles(files: MediaFileWithRelation[], searchQuery: string) {
	if (!searchQuery.trim()) return files;

	const queryLower = searchQuery.toLowerCase();

	return files.filter(
		(file) =>
			file.fileName.toLowerCase().includes(queryLower) ||
			file.filePath.toLowerCase().includes(queryLower) ||
			Boolean(file.edition?.toLowerCase().includes(queryLower)) ||
			Boolean(file.qualityTag?.toLowerCase().includes(queryLower)) ||
			Boolean(file.source?.toLowerCase().includes(queryLower)),
	);
}

/** Files attached to a title or to one episode, with the free-text filter shared by the dialog and the page. */
export function useMediaFiles({ metadataId, episodeId, enabled }: UseMediaFilesOptions) {
	const [searchQuery, setSearchQuery] = useState("");

	const query = useQuery<MediaFileWithRelation[]>({
		queryKey: mediaKeys.detailsModal({ metadataId, episodeId }),
		queryFn: async () => {
			const filter: Record<string, unknown> = { limit: 100 };
			if (metadataId) filter.metadataId = metadataId;

			if (episodeId) filter.episodeId = episodeId;

			const res = await reelvault.media.getAll(filter);

			return res.data;
		},
		enabled: enabled && (Boolean(metadataId) || Boolean(episodeId)),
		staleTime: 300_000,
	});

	const files = query.data ?? [];
	const filteredFiles = filterMediaFiles(files, searchQuery);

	const retry = () => {
		startTransition(async () => {
			await query.refetch();
		});
	};

	return { query, files, filteredFiles, searchQuery, setSearchQuery, retry };
}
