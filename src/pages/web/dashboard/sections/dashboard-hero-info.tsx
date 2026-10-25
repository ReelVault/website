import type { MetadataWithRelation } from "@reelvault/sdk";
import { Link } from "@tanstack/react-router";
import { Calendar, Clock, Info, Play, Star } from "lucide-react";
import { usePlaybackSuggestion } from "@/client/hooks/use-me-playback";
import { useIsOnWatchlist, useWatchlistToggle } from "@/client/hooks/use-watchlist";
import { AsyncButton } from "@/components/async-button";
import { SimpleAnimation } from "@/components/simple-animation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { getYearFromDate } from "@/utils/date-utils";
import { toast } from "@/utils/toast-facade";

export function DashboardHeroInfo({ metadata }: { metadata: MetadataWithRelation }) {
	const { data: streamData } = usePlaybackSuggestion(metadata.id);
	const suggestion = streamData?.suggestion;

	const { isOnWatchlist } = useIsOnWatchlist(metadata.id);
	const watchlistToggle = useWatchlistToggle();

	const handleAddToWatchlist = async () => {
		const nextState = !isOnWatchlist;
		await watchlistToggle.mutateAsync(metadata.id);
		toast.success(nextState ? m.components_metadata_card_added_to_list() : m.components_metadata_card_removed_from_list());
	};

	const handleWatchlistClick = () => {
		detach(handleAddToWatchlist());
	};

	return (
		<main className="relative flex h-full items-center">
			<SimpleAnimation trigger="mount" direction="scale" duration={500} className="flex max-w-4xl flex-col items-start gap-6 md:gap-8">
				<div className="flex flex-wrap items-center gap-3">
					<Badge size="lg" variant="glass">
						<Calendar className="text-muted-foreground size-3.5" data-icon="inline-start" aria-hidden="true" />
						<span className="text-foreground/90">{getYearFromDate(metadata.releaseDate)}</span>
					</Badge>

					<Badge size="lg" variant="glass">
						<Clock className="text-muted-foreground size-3.5" data-icon="inline-start" aria-hidden="true" />
						{metadata.type === "tv_show" ? m.common_series_word() : m.common_movie_word()}
					</Badge>

					{metadata.rating.avgScore > 0 && (
						<Badge weight="bold" size="lg" variant="warning">
							<Star className="size-3.5 fill-current" data-icon="inline-start" aria-hidden="true" />
							<span>{metadata.rating.avgScore}</span>
						</Badge>
					)}
				</div>

				<div className="max-w-3xl">
					<Link to="/details/$id" params={{ id: metadata.id }} className="group block">
						<h1 className="text-foreground group-hover:text-primary text-4xl font-black tracking-tight text-balance transition-colors duration-200 sm:text-6xl md:text-7xl">
							{metadata.title}
						</h1>
					</Link>
				</div>

				<p className="text-muted-foreground line-clamp-3 max-w-2xl text-base leading-relaxed font-normal sm:text-lg">{metadata.overview}</p>

				<div className="flex flex-wrap items-center gap-4 pt-2">
					{suggestion && (
						<Button size="hero" nativeButton={false} render={<Link to="/player/$id" params={{ id: suggestion.mediaFileId }} />}>
							<Play className="size-4 fill-current" data-icon="inline-start" aria-hidden="true" />
							{(suggestion.type === "continue" || suggestion.type === "next_episode") && m.web_continue_watching()}
							{suggestion.type === "new" && m.web_watch_teraz()}
						</Button>
					)}

					<Button variant="outline" size="hero" nativeButton={false} render={<Link to="/details/$id" params={{ id: metadata.id }} />}>
						<Info className="size-4" data-icon="inline-start" aria-hidden="true" />
						{m.common_details()}
					</Button>
				</div>

				<div className="mt-4 flex items-center gap-6">
					<AsyncButton
						type="button"
						variant="ghost"
						isPending={watchlistToggle.isPending}
						pendingLabel={m.common_saving_dots()}
						onClick={handleWatchlistClick}
						className="text-muted-foreground hover:text-primary text-xs transition-colors"
					>
						{isOnWatchlist ? m.web_remove_from_watchlist() : m.web_add_to_watchlist()}
					</AsyncButton>
					{metadata.collections.length > 0 && (
						<>
							<div className="bg-border h-3 w-px" />
							<Button
								tone="muted"
								variant="ghost"
								nativeButton={false}
								render={<Link to="/collections/$id" params={{ id: metadata.collections[0]?.id ?? "#" }} />}
								size="sm"
							>
								{m.web_show_collections()}
							</Button>
						</>
					)}
				</div>
			</SimpleAnimation>
		</main>
	);
}
