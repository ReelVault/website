import { useEpisodes } from "@/client/hooks/use-episodes";
import { useSeasons } from "@/client/hooks/use-seasons";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { m } from "@/paraglide/messages";

interface ReassignTvSelectorsProps {
	metadataId: string;
	selectedSeasonId: string | null;
	onSeasonChange: (seasonId: string | null) => void;
	selectedEpisodeId: string | null;
	onEpisodeChange: (episodeId: string | null) => void;
}

export function ReassignTvSelectors({
	metadataId,
	selectedSeasonId,
	onSeasonChange,
	selectedEpisodeId,
	onEpisodeChange,
}: ReassignTvSelectorsProps) {
	const seasonsQuery = useSeasons(metadataId);
	const localSeasons = seasonsQuery.data?.data ?? [];

	const episodesQuery = useEpisodes(selectedSeasonId);
	const localEpisodes = episodesQuery.data?.data ?? [];

	return (
		<div className="grid grid-cols-2 gap-3 rounded-lg border border-border/80 bg-muted/20 p-3">
			<div className="space-y-1.5">
				<Label className="text-xs">{m.components_select_season_label()}</Label>
				<Select value={selectedSeasonId ?? ""} onValueChange={onSeasonChange}>
					<SelectTrigger className="h-9 text-xs">
						<SelectValue placeholder={m.common_select_season()} />
					</SelectTrigger>
					<SelectContent>
						{localSeasons.map((season) => (
							<SelectItem key={season.id} value={season.id} className="text-xs">
								{season.seasonNumber === 0
									? m.components_special_episodes()
									: m.components_season_number_label({ number: season.seasonNumber })}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-1.5">
				<Label className="text-xs">{m.components_select_episode_label()}</Label>
				<Select value={selectedEpisodeId ?? ""} onValueChange={onEpisodeChange} disabled={!selectedSeasonId || localEpisodes.length === 0}>
					<SelectTrigger className="h-9 text-xs">
						<SelectValue placeholder={selectedSeasonId ? m.common_select_episode() : m.common_select_season_first()} />
					</SelectTrigger>
					<SelectContent>
						{localEpisodes.map((ep) => (
							<SelectItem key={ep.id} value={ep.id} className="text-xs">
								{m.components_episode_numbered({ number: ep.episodeNumber, title: ep.title ?? "" })}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
