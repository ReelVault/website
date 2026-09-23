import { Link } from "@tanstack/react-router";
import { Flame } from "lucide-react";
import { useMetadataPopular } from "@/client/hooks/use-metadata-queries";
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

export default function DashboardPopular() {
	const popularQuery = useMetadataPopular(12);
	const items = popularQuery.data?.data ?? [];

	if (!(popularQuery.isPending || popularQuery.isError) && items.length === 0) {
		return null;
	}

	const renderCarouselArea = () => {
		if (popularQuery.isPending) {
			return <DashboardCarouselSkeleton />;
		}

		if (popularQuery.isError) {
			return (
				<AppErrorState
					title={m.web_popular_fetch_failed()}
					description={m.web_popular_problem()}
					error={popularQuery.error}
					onRetry={() => detach(popularQuery.refetch())}
				/>
			);
		}

		if (items.length > 0) {
			return (
				<SimpleAnimation direction="up" delay={80}>
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

		return <AppEmptyState title={m.web_popular_empty_title()} description={m.web_popular_empty_desc()} />;
	};

	return (
		<section className="flex flex-col gap-8 sm:gap-10">
			<DashboardSectionTitle icon={Flame} category={m.web_most_watched()} title={m.web_popular_title()} subtitle={m.web_popular_subtitle()}>
				<Button variant="outline" nativeButton={false} render={<Link to={"/discovery"} />} className="hidden shrink-0 sm:inline-flex">
					{m.web_discover_more()}
				</Button>
			</DashboardSectionTitle>

			{renderCarouselArea()}

			<div className="pt-2 sm:hidden">
				<Button variant="outline" nativeButton={false} render={<Link to={"/discovery"} />} className="w-full">
					{m.web_discover_more()}
				</Button>
			</div>
		</section>
	);
}
