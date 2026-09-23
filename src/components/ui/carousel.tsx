import { cn } from "cn";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { type ComponentProps, createContext, type KeyboardEvent, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

interface CarouselProps {
	opts?: CarouselOptions;
	plugins?: CarouselPlugin;
	orientation?: "horizontal" | "vertical";
	setApi?: (api: CarouselApi) => void;
}

type CarouselContextProps = {
	carouselRef: ReturnType<typeof useEmblaCarousel>[0];
	api: ReturnType<typeof useEmblaCarousel>[1];
	scrollPrev: () => void;
	scrollNext: () => void;
	canScrollPrev: boolean;
	canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = createContext<CarouselContextProps | null>(null);

function useCarousel() {
	const context = useContext(CarouselContext);

	if (!context) {
		throw new Error("useCarousel must be used within a <Carousel />");
	}

	return context;
}

function Carousel({
	orientation = "horizontal",
	opts,
	setApi,
	plugins,
	className,
	children,
	...props
}: ComponentProps<"div"> & CarouselProps) {
	const [carouselRef, api] = useEmblaCarousel(
		{
			watchFocus: true,
			...opts,
			axis: orientation === "horizontal" ? "x" : "y",
		},
		plugins,
	);
	const [canScrollPrev, setCanScrollPrev] = useState(false);
	const [canScrollNext, setCanScrollNext] = useState(false);

	const scrollPrev = useCallback(() => {
		api?.scrollPrev();
	}, [api]);

	const scrollNext = useCallback(() => {
		api?.scrollNext();
	}, [api]);

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.target !== event.currentTarget) return;

		if (event.key === "ArrowLeft") {
			event.preventDefault();
			scrollPrev();
		} else if (event.key === "ArrowRight") {
			event.preventDefault();
			scrollNext();
		}
	};

	useEffect(() => {
		if (!(api && setApi)) return;

		// react-doctor-disable-next-line react-doctor/no-pass-data-to-parent, react-doctor/no-pass-live-state-to-parent, react-doctor/no-prop-callback-in-effect
		setApi(api);
	}, [api, setApi]);

	useEffect(() => {
		if (!api) {
			return () => {
				// No-op: without a carousel instance there are no listeners to detach.
			};
		}

		const handleSelect = (carouselApi: CarouselApi) => {
			if (!carouselApi) return;

			setCanScrollPrev(carouselApi.canScrollPrev());
			setCanScrollNext(carouselApi.canScrollNext());
		};

		handleSelect(api);
		api.on("reInit", handleSelect);
		api.on("select", handleSelect);

		return () => {
			api.off("select", handleSelect);
			api.off("reInit", handleSelect);
		};
	}, [api]);

	const contextValue = useMemo(
		() => ({
			carouselRef,
			api,
			opts,
			orientation,
			scrollPrev,
			scrollNext,
			canScrollPrev,
			canScrollNext,
		}),
		[carouselRef, api, opts, orientation, scrollPrev, scrollNext, canScrollPrev, canScrollNext],
	);

	return (
		<CarouselContext.Provider value={contextValue}>
			<section
				onKeyDown={handleKeyDown}
				className={cn("relative", className)}
				// react-doctor-disable-next-line react-doctor/no-redundant-roles
				role="region"
				aria-roledescription="carousel"
				data-slot="carousel"
				{...props}
			>
				{children}
			</section>
		</CarouselContext.Provider>
	);
}

function CarouselContent({ className, ...props }: ComponentProps<"div">) {
	const { carouselRef, orientation } = useCarousel();

	return (
		<div
			ref={carouselRef}
			className={cn("overflow-hidden", orientation === "horizontal" ? "touch-pan-y" : "touch-pan-x")}
			data-slot="carousel-content"
		>
			<div className={cn("flex", orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col", className)} {...props} />
		</div>
	);
}

function CarouselItem({ className, ...props }: ComponentProps<"fieldset">) {
	const { orientation } = useCarousel();

	return (
		<fieldset
			aria-roledescription="slide"
			data-slot="carousel-item"
			className={cn("min-w-0 shrink-0 grow-0 basis-full", orientation === "horizontal" ? "pl-4" : "pt-4", className)}
			{...props}
		/>
	);
}

function CarouselPrevious({ className, variant = "outline", size = "icon-sm", ...props }: ComponentProps<typeof Button>) {
	const { orientation, scrollPrev, canScrollPrev } = useCarousel();

	return (
		<Button
			data-slot="carousel-previous"
			variant={variant}
			size={size}
			className={cn(
				"absolute touch-manipulation rounded-full",
				orientation === "horizontal" ? "inset-y-0 -left-12 my-auto" : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
				className,
			)}
			disabled={!canScrollPrev}
			onClick={scrollPrev}
			{...props}
		>
			<ChevronLeftIcon />
			<span className="sr-only">{m.common_previous_slide()}</span>
		</Button>
	);
}

function CarouselNext({ className, variant = "outline", size = "icon-sm", ...props }: ComponentProps<typeof Button>) {
	const { orientation, scrollNext, canScrollNext } = useCarousel();

	return (
		<Button
			data-slot="carousel-next"
			variant={variant}
			size={size}
			className={cn(
				"absolute touch-manipulation rounded-full",
				orientation === "horizontal" ? "inset-y-0 -right-12 my-auto" : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
				className,
			)}
			disabled={!canScrollNext}
			onClick={scrollNext}
			{...props}
		>
			<ChevronRightIcon />
			<span className="sr-only">{m.common_next_slide()}</span>
		</Button>
	);
}

export { Carousel, type CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, useCarousel };
