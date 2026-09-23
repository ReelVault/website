import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import type { MetadataWithRelation } from "reelvault-sdk";
import { useDiscovery } from "@/client/hooks/use-discovery";
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

// The discovery endpoint returns raw DTOs that are structurally compatible with
// MetadataWithRelation; narrow them with a runtime check instead of an unsafe
// type assertion.
const isMetadataWithRelation = (item: unknown): item is MetadataWithRelation =>
	typeof item === "object" && item !== null && "id" in item && "title" in item;

export default function DashboardRecommendations() {
	const { discoverQuery, discoverView } = useDiscovery();

	const recommendations = (discoverView?.recommendations ?? []).filter((item) => isMetadataWithRelation(item));
	const trending = (discoverView?.trending ?? []).filter((item) => isMetadataWithRelation(item));
	const baseItems = recommendations.length > 0 ? recommendations : trending;
	const isFallbackTrending = recommendations.length === 0 && trending.length > 0;
	const items = baseItems.slice(5);

	// If the query succeeded and there is nothing in the catalog (or after the hero), hide the section
	if (!(discoverQuery.isPending || discoverQuery.isError) && items.length === 0) {
		return null;
	}

	const renderCarouselArea = () => {
		if (discoverQuery.isPending) {
			return <DashboardCarouselSkeleton />;
		}

		if (discoverQuery.isError) {
			return (
				<AppErrorState
					title={m.web_recommendations_fetch_failed()}
					description={m.web_suggestions_problem()}
					error={discoverQuery.error}
					onRetry={() => detach(discoverQuery.refetch())}
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

		return <AppEmptyState title={m.web_no_recommendations()} description={m.web_watch_for_suggestions()} />;
	};

	return (
		<section className="flex flex-col gap-8 sm:gap-10">
			<DashboardSectionTitle
				icon={Sparkles}
				category={isFallbackTrending ? m.web_trending_now() : m.web_for_you()}
				title={m.web_for_you_title()}
				subtitle={isFallbackTrending ? m.web_hits_subtitle() : m.web_for_you_subtitle()}
			>
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
