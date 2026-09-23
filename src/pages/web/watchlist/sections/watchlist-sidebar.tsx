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
					<h3 className="mb-6 font-semibold text-foreground text-xl tracking-tight">{m.web_watchlist_stats_title()}</h3>

					<div className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:grid-cols-1">
						<div className="flex items-center gap-4 sm:col-span-3 lg:col-span-1">
							<div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<Film className="size-5" data-icon="inline-start" aria-hidden="true" />
							</div>
							<div>
								<p className="font-medium text-muted-foreground text-xs">{m.web_watchlist_stats_total()}</p>
								<p className="font-semibold text-2xl tabular-nums">{stats.total}</p>
							</div>
						</div>
						<div>
							<p className="font-black text-[10px] text-muted-foreground uppercase tracking-widest">{m.web_watchlist_stats_movies()}</p>
							<p className="font-semibold text-lg tabular-nums">{stats.movies}</p>
						</div>
						<div>
							<p className="font-black text-[10px] text-muted-foreground uppercase tracking-widest">{m.web_watchlist_stats_series()}</p>
							<p className="font-semibold text-lg tabular-nums">{stats.series}</p>
						</div>
					</div>

					<Button variant="outline" nativeButton={false} render={<Link to="/insights" />} className="mt-6 w-full gap-2 font-medium">
						<BarChart3 className="size-4 text-primary" data-icon="inline-start" aria-hidden="true" />
						{m.web_watchlist_stats_full_insights()}
					</Button>

					{suggestedItem && (
						<Button
							nativeButton={false}
							render={<Link to="/details/$id" params={{ id: suggestedItem.id }} />}
							className="mt-3 w-full font-bold"
						>
							{m.web_watchlist_open_suggestion()}
						</Button>
					)}
				</div>
			</SimpleAnimation>

			{/* Quick Tip */}
			{totalCount > 0 && (
				<SimpleAnimation direction="none" delay={100} duration={300}>
					<div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
						<p className="font-bold text-foreground/80 text-xs leading-relaxed">
							<span className="text-primary">{m.web_watchlist_tip_label()}</span> {m.web_watchlist_tip_queue({ count: totalCount })}
						</p>
					</div>
				</SimpleAnimation>
			)}
		</aside>
	);
}
