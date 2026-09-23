import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BarChart2 } from "lucide-react";
import { m } from "@/paraglide/messages";
import { usePlayerActions, usePlayerDiagnosticsToggle, usePlayerInfo, usePlayerNextEpisode } from "../player-context";
import { detach } from "../utils/player-utils";
import { PlayerControlButton } from "./player-control-button";

export function PlayerHeader() {
	const navigate = useNavigate();
	const info = usePlayerInfo();
	const diagnosticsToggle = usePlayerDiagnosticsToggle();
	const { currentEpisode } = usePlayerNextEpisode();
	const actions = usePlayerActions();

	const handleBack = async () => {
		try {
			await actions.syncPlaybackProgress(true);
		} catch (error) {
			console.error("Failed to sync playback progress on back:", error);
		}

		if (document.fullscreenElement) {
			detach(() => document.exitFullscreen());
		}

		if (window.history.length > 1) {
			window.history.back();
		} else if (info.metadataId) {
			await navigate({ to: "/details/$id", params: { id: info.metadataId } });
		} else {
			window.history.back();
		}
	};

	const topLabel = currentEpisode
		? m.player_season_episode_badge({ season: currentEpisode.seasonNumber, episode: currentEpisode.episodeNumber })
		: m.player_watching_now();

	const displayTitle =
		currentEpisode?.title && currentEpisode.title.toLowerCase() !== m.player_episode_number_lower({ number: currentEpisode.episodeNumber })
			? `${info.title} — ${currentEpisode.title}`
			: info.title;

	return (
		<div className="grid w-full grid-cols-3 items-center justify-between gap-4">
			<div className="flex items-center justify-start">
				<PlayerControlButton
					description={m.player_back_to_previous_page()}
					render={<button type="button" onClick={() => detach(handleBack)} aria-label={m.player_back_to_previous_page()} />}
				>
					<ArrowLeft className="size-5" aria-hidden="true" />
				</PlayerControlButton>
			</div>

			<div className="flex flex-col items-center text-center">
				<span className="font-black text-[10px] text-primary/80 uppercase tracking-[0.3em]">{topLabel}</span>
				<h1 className="line-clamp-1 font-semibold text-foreground text-xl tracking-tight">{displayTitle}</h1>
			</div>

			<div className="flex items-center justify-end">
				<PlayerControlButton
					description={m.player_show_playback_stats()}
					render={
						<button
							type="button"
							onClick={diagnosticsToggle.toggle}
							aria-pressed={diagnosticsToggle.isOpen}
							data-state={diagnosticsToggle.isOpen ? "open" : "closed"}
						/>
					}
				>
					<BarChart2 className="size-4" aria-hidden="true" />
					<span className="hidden lg:inline">{m.player_statistics_word()}</span>
				</PlayerControlButton>
			</div>
		</div>
	);
}
