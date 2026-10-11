import { Link } from "@tanstack/react-router";
import { useState, ViewTransition } from "react";
import type { WatchlistItem } from "@/client/hooks/use-watchlist";
import { AppEmptyState } from "@/components/app-states";
import { MetadataCard } from "@/components/cards/metadata-card";
import { LazyRender } from "@/components/lazy-render";
import { SimpleAnimation } from "@/components/simple-animation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { m } from "@/paraglide/messages";
import { runTransition } from "@/utils/view-transitions";

type WatchlistSort = "added" | "title" | "year";

/** Maps a select value back to a sort; an unknown value keeps the server order. */
function toWatchlistSort(value: string | null): WatchlistSort {
	if (value === "title" || value === "year") return value;

	return "added";
}

function emptyTitleFor(filterValue: string): string {
	if (filterValue === "all") return m.web_watchlist_empty();

	if (filterValue === "movie") return m.web_no_movies_on_watchlist();

	return m.web_no_series_on_watchlist();
}

/** `added` keeps the server order (most recently added first); the other sorts reorder the loaded list. */
function sortWatchlist(items: WatchlistItem[], sort: WatchlistSort): WatchlistItem[] {
	if (sort === "title") return items.toSorted((a, b) => a.title.localeCompare(b.title));

	if (sort === "year") return items.toSorted((a, b) => b.releaseDate.localeCompare(a.releaseDate));

	return items;
}

export function WatchlistGrid({ metadata }: { metadata: WatchlistItem[] }) {
	const [filter, setFilter] = useState("all");
	const [search, setSearch] = useState("");
	const [sort, setSort] = useState<WatchlistSort>("added");

	// The whole watchlist is loaded, so the title search and the sorts run on it directly.
	const query = search.trim().toLocaleLowerCase();
	const typeFiltered = filter === "all" ? metadata : metadata.filter((item) => item.type === filter);
	const searched = query ? typeFiltered.filter((item) => item.title.toLocaleLowerCase().includes(query)) : typeFiltered;
	const filteredMetadata = sortWatchlist(searched, sort);

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
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
					<Input
						type="search"
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						placeholder={m.web_watchlist_search_placeholder()}
						aria-label={m.web_watchlist_search_placeholder()}
						className="sm:w-56"
					/>
					<Select
						value={sort}
						onValueChange={(value) => {
							setSort(toWatchlistSort(value));
						}}
					>
						<SelectTrigger aria-label={m.web_watchlist_sort_label()} className="w-full sm:w-44">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="added">{m.web_watchlist_sort_added()}</SelectItem>
							<SelectItem value="title">{m.web_watchlist_sort_title()}</SelectItem>
							<SelectItem value="year">{m.web_watchlist_sort_year()}</SelectItem>
						</SelectContent>
					</Select>
					<p className="hidden px-4 text-muted-foreground text-sm sm:block">{m.common_items_count({ count: filteredMetadata.length })}</p>
				</div>
			</div>

			{/* Grid — animated only when the type changes */}
			<ViewTransition update={{ default: "none", tab: "auto" }}>
				{filteredMetadata.length === 0 ? (
					<AppEmptyState
						title={query ? m.web_watchlist_no_matches() : emptyTitleFor(filter)}
						description={query ? m.web_watchlist_no_matches_description() : m.web_add_catalog_titles_hint()}
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
