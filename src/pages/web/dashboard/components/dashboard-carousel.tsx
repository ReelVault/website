import type { UseQueryResult } from "@tanstack/react-query";
import type { ComponentProps, ReactNode } from "react";
import { AppEmptyState, AppErrorState } from "@/components/app-states";
import { MetadataCard } from "@/components/cards/metadata-card";
import { LazyRender } from "@/components/lazy-render";
import { SimpleAnimation } from "@/components/simple-animation";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { detach } from "@/lib/detach";
import { DashboardCarouselSkeleton } from "./dashboard-carousel-skeleton";

type RailMetadata = ComponentProps<typeof MetadataCard>["metadata"];

type RailQuery = Pick<UseQueryResult, "isPending" | "isError" | "error" | "refetch">;

interface DashboardCarouselProps {
	items: RailMetadata[];
	/** Drives the skeleton while loading and the error state; the items come from the same query. */
	query: RailQuery;
	errorTitle: string;
	errorDescription?: ReactNode;
	emptyTitle: string;
	emptyDescription: string;
	delay?: number;
}

/** A horizontal row of title cards with the loading, error and empty states of its query. */
export function DashboardCarousel({
	items,
	query,
	errorTitle,
	errorDescription,
	emptyTitle,
	emptyDescription,
	delay = 80,
}: DashboardCarouselProps) {
	if (query.isPending) {
		return <DashboardCarouselSkeleton />;
	}

	if (query.isError) {
		return <AppErrorState title={errorTitle} description={errorDescription} error={query.error} onRetry={() => detach(query.refetch())} />;
	}

	if (items.length === 0) {
		return <AppEmptyState title={emptyTitle} description={emptyDescription} />;
	}

	return (
		<SimpleAnimation direction="up" delay={delay}>
			<Carousel opts={{ align: "start", dragFree: true }} className="w-full">
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
