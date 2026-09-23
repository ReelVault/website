import { Link } from "@tanstack/react-router";
import { Broccoli } from "lucide-react";
import { useInView } from "react-intersection-observer";
import type { MetadataType } from "@reelvault/sdk";
import { useMetadataRecentlyAdded } from "@/client/hooks/use-metadata-queries";
import { AppEmptyState, AppErrorState } from "@/components/app-states";
import { MetadataCard } from "@/components/cards/metadata-card";
import { LazyRender } from "@/components/lazy-render";
import { SimpleAnimation } from "@/components/simple-animation";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { DashboardCarouselSkeleton } from "../components/dashboard-carousel-skeleton";
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
	const { ref, inView } = useInView({ triggerOnce: true, rootMargin: "600px 0px" });
	const query = useMetadataRecentlyAdded(limit, type, { enabled: inView });
	const items = query.data?.data ?? [];

	const renderCarouselArea = () => {
		if (query.isPending) {
			return <DashboardCarouselSkeleton />;
		}

		if (query.isError) {
			return <AppErrorState title={errorTitle} error={query.error} onRetry={() => detach(query.refetch())} />;
		}

		if (items.length > 0) {
			return (
				<SimpleAnimation direction="up" delay={delay}>
					<Carousel
						opts={{
							align: "start",
							dragFree: true,
						}}
						className="w-full"
					>
						<CarouselContent>
							{items.map((item) => (
								<CarouselItem key={item.id} className="basis-auto">
									<LazyRender minHeight={320}>{() => <MetadataCard size="lg" metadata={item} />}</LazyRender>
								</CarouselItem>
							))}
						</CarouselContent>
					</Carousel>
				</SimpleAnimation>
			);
		}

		return <AppEmptyState title={emptyTitle} description={emptyDescription} />;
	};

	return (
		<div ref={ref} className="flex flex-col gap-6">
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<div className="size-2 rounded-full bg-primary" />
					<h3 className="font-bold text-foreground text-xl tracking-tight sm:text-2xl">{title}</h3>
				</div>
				<Button variant="outline" nativeButton={false} render={<Link to={actionHref} />} className="hidden sm:inline-flex">
					{actionLabel}
				</Button>
			</div>

			{renderCarouselArea()}

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
