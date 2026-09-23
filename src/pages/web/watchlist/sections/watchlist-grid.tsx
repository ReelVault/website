import { Link } from "@tanstack/react-router";
import { useState, ViewTransition } from "react";
import type { WatchlistItem } from "@/client/hooks/use-watchlist";
import { AppEmptyState } from "@/components/app-states";
import { MetadataCard } from "@/components/cards/metadata-card";
import { LazyRender } from "@/components/lazy-render";
import { SimpleAnimation } from "@/components/simple-animation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { m } from "@/paraglide/messages";
import { runTransition } from "@/utils/view-transitions";

function emptyTitleFor(filterValue: string): string {
	if (filterValue === "all") return m.web_watchlist_empty();

	if (filterValue === "movie") return m.web_no_movies_on_watchlist();

	return m.web_no_series_on_watchlist();
}

export function WatchlistGrid({ metadata }: { metadata: WatchlistItem[] }) {
	const [filter, setFilter] = useState("all");

	const filteredMetadata = filter === "all" ? metadata : metadata.filter((item) => item.type === filter);

	return (
		<main className="flex flex-1 flex-col gap-10">
			{/* Filters Bar */}
			<div className="cinema-surface flex flex-col gap-3 p-2 sm:flex-row sm:items-center sm:justify-between">
				<Tabs value={filter} onValueChange={(value: string) => runTransition("tab", () => setFilter(value))}>
					<TabsList aria-label={m.web_filter_watchlist()}>
						<TabsTrigger value="all">{m.common_all()}</TabsTrigger>
						<TabsTrigger value="movie">{m.web_watchlist_stats_movies()}</TabsTrigger>
						<TabsTrigger value="tv_show">{m.web_watchlist_stats_series()}</TabsTrigger>
					</TabsList>
				</Tabs>
				<p className="hidden px-4 text-muted-foreground text-sm sm:block">{m.common_items_count({ count: filteredMetadata.length })}</p>
			</div>

			{/* Grid — animated only when the type changes */}
			<ViewTransition update={{ default: "none", tab: "auto" }}>
				{filteredMetadata.length === 0 ? (
					<AppEmptyState
						title={emptyTitleFor(filter)}
						description={m.web_add_catalog_titles_hint()}
						action={
							<Button nativeButton={false} render={<Link to="/movies" />}>
								{m.components_navbar_search_catalog()}
							</Button>
						}
					/>
				) : (
					<div className="poster-shelf">
						{filteredMetadata.map((item) => (
							<LazyRender key={item.id} minHeight={320} rootMargin="350px 0px" className="flex min-w-0 justify-center">
								{() => (
									<SimpleAnimation direction="up" duration={240} className="w-full">
										<MetadataCard metadata={item} fluid />
									</SimpleAnimation>
								)}
							</LazyRender>
						))}
					</div>
				)}
			</ViewTransition>
		</main>
	);
}
