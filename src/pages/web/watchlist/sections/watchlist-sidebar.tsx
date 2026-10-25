import { Link } from "@tanstack/react-router";
import { BarChart3, Film } from "lucide-react";
import type { WatchlistItem } from "@/client/hooks/use-watchlist";
import { SimpleAnimation } from "@/components/simple-animation";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

export interface WatchlistStats {
	total: number;
	movies: number;
	series: number;
}

export function WatchlistSidebar({
	stats,
	suggestedItem,
	totalCount,
}: {
	stats: WatchlistStats;
	suggestedItem?: WatchlistItem;
	totalCount: number;
}) {
	return (
		<aside className="flex w-full shrink-0 flex-col gap-5 lg:w-80 xl:w-88">
			<SimpleAnimation direction="none" duration={300}>
				<div className="cinema-surface p-6 lg:p-7">
					<h3 className="text-foreground mb-6 text-xl font-semibold tracking-tight">{m.web_watchlist_stats_title()}</h3>

					<div className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:grid-cols-1">
						<div className="flex items-center gap-4 sm:col-span-3 lg:col-span-1">
							<div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-lg">
								<Film className="size-5" data-icon="inline-start" aria-hidden="true" />
							</div>
							<div>
								<p className="text-muted-foreground text-xs font-medium">{m.web_watchlist_stats_total()}</p>
								<p className="text-2xl font-semibold tabular-nums">{stats.total}</p>
							</div>
						</div>
						<div>
							<p className="text-muted-foreground text-xs font-black">{m.web_watchlist_stats_movies()}</p>
							<p className="text-lg font-semibold tabular-nums">{stats.movies}</p>
						</div>
						<div>
							<p className="text-muted-foreground text-xs font-black">{m.web_watchlist_stats_series()}</p>
							<p className="text-lg font-semibold tabular-nums">{stats.series}</p>
						</div>
					</div>

					<Button variant="outline" nativeButton={false} render={<Link to="/insights" />} className="mt-6 w-full">
						<BarChart3 className="text-primary size-4" data-icon="inline-start" aria-hidden="true" />
						{m.web_watchlist_stats_full_insights()}
					</Button>

					{suggestedItem && (
						<Button nativeButton={false} render={<Link to="/details/$id" params={{ id: suggestedItem.id }} />} className="mt-3 w-full">
							{m.web_watchlist_open_suggestion()}
						</Button>
					)}
				</div>
			</SimpleAnimation>

			{/* Quick Tip */}
			{totalCount > 0 && (
				<SimpleAnimation direction="none" delay={100} duration={300}>
					<div className="border-primary/20 bg-primary/5 rounded-xl border p-6">
						<p className="text-foreground/80 text-xs leading-relaxed font-bold">
							<span className="text-primary">{m.web_watchlist_tip_label()}</span> {m.web_watchlist_tip_queue({ count: totalCount })}
						</p>
					</div>
				</SimpleAnimation>
			)}
		</aside>
	);
}
