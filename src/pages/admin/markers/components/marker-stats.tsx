import { Bookmark, Clock, Film } from "lucide-react";
import { m } from "@/paraglide/messages";
import { AdminStatCard } from "../../admin-ui";

interface MarkerStatsProps {
	stats: {
		intros: number;
		credits: number;
		highlights: number;
		fromPlugins: number;
	};
}

export function MarkerStats({ stats }: MarkerStatsProps) {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<AdminStatCard
				label={m.admin_markers_intros()}
				value={stats.intros}
				description={m.admin_markers_episode_opening()}
				icon={Bookmark}
				tone="warning"
			/>
			<AdminStatCard
				label={m.plugins_markers_credits_word()}
				value={stats.credits}
				description={m.admin_markers_end_credits()}
				icon={Film}
				tone="default"
			/>
			<AdminStatCard
				label={m.admin_markers_highlights_label()}
				value={stats.highlights}
				description={m.admin_markers_video_highlights()}
				icon={Clock}
				tone="destructive"
			/>
			<AdminStatCard
				label={m.admin_markers_from_plugins()}
				value={stats.fromPlugins}
				description={m.admin_markers_auto_generated_desc()}
				icon={Bookmark}
				tone="success"
			/>
		</div>
	);
}
