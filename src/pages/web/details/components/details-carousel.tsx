import type { ReactNode } from "react";
import { Carousel, type CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export function DetailsCarousel({
	items,
	initialIndex,
}: {
	items: Array<{
		key: string;
		children: ReactNode;
	}>;
	initialIndex?: number;
}) {
	const setApi = (api: CarouselApi) => {
		if (api && initialIndex !== undefined) api.scrollTo(initialIndex, true);
	};
	const hasInitialIndex = initialIndex !== undefined;

	return (
		<Carousel
			opts={{
				align: hasInitialIndex ? "center" : "start",
				containScroll: hasInitialIndex ? false : "trimSnaps",
				dragFree: true,
				startIndex: initialIndex ?? 0,
			}}
			setApi={setApi}
			className="w-full px-1 sm:px-0"
		>
			<CarouselContent className="-ml-4">
				{items.map((item) => (
					<CarouselItem key={item.key} className="basis-auto pl-4">
						{item.children}
					</CarouselItem>
				))}
			</CarouselContent>
			<CarouselPrevious size="icon-lg" className="-left-5 hidden size-11 sm:flex" />
			<CarouselNext size="icon-lg" className="-right-5 hidden size-11 sm:flex" />
		</Carousel>
	);
}
