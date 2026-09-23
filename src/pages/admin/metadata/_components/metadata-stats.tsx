import type { MetadataWithRelation } from "@reelvault/sdk";
import { AlertTriangle, Clapperboard, Film, Tv } from "lucide-react";
import { m } from "@/paraglide/messages";
import { AdminStatCard } from "../../admin-ui";

export function MetadataStats({
	stats,
	total,
}: {
	stats?: {
		totalCount: number;
		moviesCount: number;
		tvShowsCount: number;
		lowConfidenceCount: number;
	};
	items?: MetadataWithRelation[];
	total: number;
}) {
	const totalCount = stats?.totalCount ?? total;
	const movies = stats?.moviesCount ?? 0;
	const shows = stats?.tvShowsCount ?? 0;
	const lowConfidence = stats?.lowConfidenceCount ?? 0;

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<AdminStatCard
				label={m.admin_metadata_all_items()}
				value={totalCount}
				description={m.admin_metadata_total_in_library()}
				icon={Film}
				tone="default"
			/>
			<AdminStatCard
				label={m.admin_libraries_type_movies()}
				value={movies}
				description={m.admin_metadata_movies()}
				icon={Clapperboard}
				tone="success"
			/>
			<AdminStatCard label="Seriale" value={shows} description={m.admin_metadata_series_episodes()} icon={Tv} tone="default" />
			<AdminStatCard
				label={m.admin_metadata_low_match()}
				value={lowConfidence}
				description={m.admin_metadata_need_verification()}
				icon={AlertTriangle}
				tone={lowConfidence > 0 ? "warning" : "default"}
			/>
		</div>
	);
}
