import type { MetadataType } from "@reelvault/sdk";
import { Link } from "@tanstack/react-router";
import { Broccoli } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { useMetadataRecentlyAdded } from "@/client/hooks/use-metadata-queries";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";
import { DashboardCarousel } from "../components/dashboard-carousel";
import DashboardSectionTitle from "../components/dashboard-section-title";

interface RecentlyAddedSectionProps {
	type: MetadataType;
	title: string;
	actionLabel: string;
	actionHref: string;
	emptyTitle: string;
	emptyDescription: string;
	errorTitle: string;
	delay?: number;
	limit?: number;
}

function RecentlyAddedSection({
	type,
	title,
	actionLabel,
	actionHref,
	emptyTitle,
	emptyDescription,
	errorTitle,
	delay = 80,
	limit = 12,
}: RecentlyAddedSectionProps) {
	// Fetched only once the row is about to scroll into view.
	const { ref, inView } = useInView({ triggerOnce: true, rootMargin: "600px 0px" });
	const query = useMetadataRecentlyAdded(limit, type, { enabled: inView });

	return (
		<div ref={ref} className="flex flex-col gap-6">
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<div className="bg-primary size-2 rounded-full" />
					<h3 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">{title}</h3>
				</div>
				<Button variant="outline" nativeButton={false} render={<Link to={actionHref} />} className="hidden sm:inline-flex">
					{actionLabel}
				</Button>
			</div>

			<DashboardCarousel
				items={query.data?.data ?? []}
				query={query}
				errorTitle={errorTitle}
				emptyTitle={emptyTitle}
				emptyDescription={emptyDescription}
				delay={delay}
			/>

			<div className="pt-2 sm:hidden">
				<Button variant="outline" nativeButton={false} render={<Link to={actionHref} />} className="w-full">
					{actionLabel}
				</Button>
			</div>
		</div>
	);
}

export default function DashboardLastAdded() {
	return (
		<section className="flex flex-col gap-12 sm:gap-16">
			<DashboardSectionTitle
				icon={Broccoli}
				category={m.admin_dashboard_last_added_category()}
				title={m.admin_dashboard_last_added_title()}
				subtitle={m.admin_dashboard_last_added_subtitle()}
			/>

			<RecentlyAddedSection
				type="movie"
				title={m.web_watchlist_stats_movies()}
				actionLabel={m.web_see_movies()}
				actionHref="/movies"
				emptyTitle={m.web_no_recent_movies()}
				emptyDescription={m.web_add_movies_hint()}
				errorTitle={m.web_recent_movies_fetch_failed()}
				delay={60}
			/>

			<RecentlyAddedSection
				type="tv_show"
				title={m.web_watchlist_stats_series()}
				actionLabel={m.web_see_series()}
				actionHref="/series"
				emptyTitle={m.web_recent_series_empty()}
				emptyDescription={m.web_add_series_hint()}
				errorTitle={m.web_recent_series_fetch_failed()}
				delay={120}
			/>
		</section>
	);
}
