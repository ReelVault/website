import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useDiscovery } from "@/client/hooks/use-discovery";
import { LazyRender } from "@/components/lazy-render";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/use-page-title";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { DiscoverRow } from "./components/discover-row";
import { DiscoveryEmpty } from "./components/discovery-empty";
import { DiscoveryLoading } from "./components/discovery-loading";
import { DiscoveryHero } from "./sections/discovery-hero";

export default function DiscoveryPage() {
	usePageTitle(m.navbar_discovery());
	const { discoverQuery, discoverView, discoveryItems } = useDiscovery();

	return (
		<div className="cinema-page">
			<main className="cinema-shell relative">
				<DiscoveryHero />

				{discoverQuery.isLoading && <DiscoveryLoading />}

				{discoverQuery.isError && (
					<div role="alert" className="cinema-surface mt-10 max-w-xl p-6">
						<p className="font-semibold">{m.web_suggestions_fetch_failed()}</p>
						<Button
							type="button"
							variant="outline"
							className="mt-4"
							onClick={() => {
								detach(discoverQuery.refetch());
							}}
						>
							{m.common_try_again()}
						</Button>
					</div>
				)}

				{!(discoverQuery.isLoading || discoverQuery.isError) && discoveryItems.length === 0 && <DiscoveryEmpty />}

				{discoverView && (
					<div className="flex flex-col gap-16 py-12 sm:gap-20">
						<DiscoverRow title={m.web_for_you()} description={m.web_based_on_activity()} items={discoverView.recommendations} />
						<LazyRender minHeight={350} rootMargin="400px 0px">
							{() => <DiscoverRow title={m.web_trending_now()} description={m.web_most_reached_titles()} items={discoverView.trending} />}
						</LazyRender>
						<LazyRender minHeight={350} rootMargin="400px 0px">
							{() => (
								<DiscoverRow
									title={m.web_newest_movies()}
									description={m.web_recently_added_desc()}
									items={discoverView.recentlyAddedMovies}
								/>
							)}
						</LazyRender>
						<LazyRender minHeight={350} rootMargin="400px 0px">
							{() => (
								<DiscoverRow
									title={m.web_discovery_newest_series()}
									description={m.web_new_series_ready()}
									items={discoverView.recentlyAddedShows}
								/>
							)}
						</LazyRender>
					</div>
				)}

				<nav className="mt-4 flex flex-wrap gap-5 border-border/70 border-t pt-7 text-sm" aria-label={m.web_more_from_catalog()}>
					<Link to="/movies" className="inline-flex items-center gap-2 font-semibold text-primary hover:text-primary/75">
						{m.web_whole_library()}
						<ArrowRight className="size-4" aria-hidden="true" />
					</Link>
					<Link to="/companies" className="inline-flex items-center gap-2 font-semibold text-primary hover:text-primary/75">
						{m.web_browse_studios()}
						<ArrowRight className="size-4" aria-hidden="true" />
					</Link>
				</nav>
			</main>
		</div>
	);
}
