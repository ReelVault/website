import { Layers } from "lucide-react";
import { useMediaFilesByMetadata } from "@/client/hooks/use-media";
import { Badge } from "@/components/ui/badge";
import { m } from "@/paraglide/messages";

export function DetailsMultipleFilesBadge({ metadataId }: { metadataId: string }) {
	const { data: files = [] } = useMediaFilesByMetadata(metadataId);

	if (files.length <= 1) return null;

	let hasMultipleForTv = false;
	const seenEpisodeIds = new Set<string>();
	for (const f of files) {
		if (f.episodeId) {
			if (seenEpisodeIds.has(f.episodeId)) {
				hasMultipleForTv = true;
				break;
			}

			seenEpisodeIds.add(f.episodeId);
		}
	}

	const hasMultipleForMovie = files.length > 1 && files.some((f) => f.movieId !== null);

	if (!(hasMultipleForTv || hasMultipleForMovie)) return null;

	return (
		<Badge size="lg" variant="primary">
			<Layers className="text-primary size-4" />
			{m.web_multiple_releases()}
		</Badge>
	);
}
