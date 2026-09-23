import type { MediaFileWithRelation } from "@reelvault/sdk";
import { BadgeCheck, FileVideo, Film, Tv } from "lucide-react";
import { m } from "@/paraglide/messages";
import { AdminStatCard } from "../../admin-ui";

export function MediaStats({
	stats,
	total,
}: {
	stats?: {
		totalFiles: number;
		totalSize: number;
		moviesCount: number;
		episodesCount: number;
		withQualityCount: number;
	};
	files?: MediaFileWithRelation[];
	total: number;
}) {
	const totalFiles = stats?.totalFiles ?? total;
	const movies = stats?.moviesCount ?? 0;
	const shows = stats?.episodesCount ?? 0;
	const withQuality = stats?.withQualityCount ?? 0;

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<AdminStatCard
				label={m.admin_media_all_video_files()}
				value={totalFiles}
				description={m.admin_media_total_files_in_database()}
				icon={FileVideo}
				tone="default"
			/>
			<AdminStatCard
				label={m.admin_media_linked_to_movies()}
				value={movies}
				description={m.admin_media_files_linked_to_movies()}
				icon={Film}
				tone="success"
			/>
			<AdminStatCard
				label={m.admin_media_series_episodes_label()}
				value={shows}
				description={m.admin_media_files_assigned_to_episodes()}
				icon={Tv}
				tone="default"
			/>
			<AdminStatCard
				label={m.admin_media_with_quality_label()}
				value={withQuality}
				description={m.admin_media_extracted_profile_quality()}
				icon={BadgeCheck}
				tone={withQuality > 0 ? "success" : "warning"}
			/>
		</div>
	);
}
