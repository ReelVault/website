import { useWatchlist } from "@/client/hooks/use-watchlist";
import { AppErrorState } from "@/components/app-states";
import { usePageTitle } from "@/hooks/use-page-title";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { WatchlistPageSkeleton } from "./components/watchlist-page-skeleton";
import { WatchlistGrid } from "./sections/watchlist-grid";
import { WatchlistHero } from "./sections/watchlist-hero";
import { WatchlistSidebar } from "./sections/watchlist-sidebar";

export default function WatchlistPage() {
	usePageTitle(m.components_navbar_watchlist_link());
	const { metadata, isLoading, error, refetch } = useWatchlist();

	if (isLoading) return <WatchlistPageSkeleton />;

	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center p-6">
				<AppErrorState
					title={m.web_watchlist_fetch_failed()}
					description={m.web_check_connection()}
					error={error}
					onRetry={() => detach(refetch())}
				/>
			</div>
		);
	}

	const featuredItem = metadata[0];

	// Stats derive directly from the metadata currently fetched.
	let moviesCount = 0;
	for (const item of metadata) {
		if (item.type === "movie") moviesCount++;
	}

	const stats = {
		total: metadata.length,
		movies: moviesCount,
		series: metadata.length - moviesCount,
	};

	return (
		<div className="min-h-screen bg-background pt-16 lg:pt-20">
			{featuredItem && <WatchlistHero featuredItem={featuredItem} />}

			<div className="cinema-shell">
				<div className="flex flex-col gap-10 lg:flex-row">
					<WatchlistGrid metadata={metadata} />
					<WatchlistSidebar stats={stats} suggestedItem={featuredItem} totalCount={metadata.length} />
				</div>
			</div>
		</div>
	);
}
