import { cn } from "cn";
import { type ComponentProps, type ReactElement, type SyntheticEvent, useState } from "react";

const DEFAULT_FALLBACK_SRC = "/basic/unknown-cover.jpg";
const DEFAULT_FILL_WIDTHS = [384, 640, 1080, 1500, 1920] as const;

export interface ImageLoaderProps {
	src: string;
	width: number;
	quality?: number;
}

export type ImageLoader = (props: ImageLoaderProps) => string;

function getRawSrc(src: ComponentProps<typeof Image>["src"]): string | undefined {
	if (typeof src === "string") return src;

	return src && typeof src === "object" && "src" in src ? src.src : undefined;
}

function resolveSources(
	loader: ImageLoader | undefined,
	imageSrc: string | undefined,
	hasError: boolean,
	fill: boolean | undefined,
	resolvedWidth: number | undefined,
	scale: number,
	propSrcSet: string | undefined,
): {
	src: string | undefined;
	srcSet: string | undefined;
} {
	if (!(loader && imageSrc) || hasError) return { src: imageSrc, srcSet: propSrcSet };

	if (fill) {
		const srcSet = propSrcSet ?? DEFAULT_FILL_WIDTHS.map((width) => `${loader({ src: imageSrc, width })} ${width}w`).join(", ");

		return { src: loader({ src: imageSrc, width: 1080 }), srcSet };
	}

	if (resolvedWidth) {
		const targetWidth = Math.round(resolvedWidth * scale);
		const srcSet =
			propSrcSet ?? `${loader({ src: imageSrc, width: targetWidth })} 1x, ${loader({ src: imageSrc, width: targetWidth * 2 })} 2x`;

		return { src: loader({ src: imageSrc, width: targetWidth }), srcSet };
	}

	return { src: loader({ src: imageSrc, width: 500 }), srcSet: propSrcSet };
}

export function Image({
	src,
	fallbackSrc = DEFAULT_FALLBACK_SRC,
	placeholderSrc,
	alt = "",
	fill,
	size,
	width,
	height,
	aspectRatio,
	scale = 1,
	loader,
	className,
	loading,
	priority,
	sizes,
	srcSet: propSrcSet,
	onError,
	onLoad,
	ref,
	style,
	unoptimized,
	...props
}: Omit<ComponentProps<"img">, "src"> & {
	src?: string | { src: string } | null;
	fallbackSrc?: string;
	placeholderSrc?: string | null;
	fill?: boolean;
	size?: number | `${number}`;
	aspectRatio?: number;
	scale?: number;
	loader?: ImageLoader;
	unoptimized?: boolean;
	priority?: boolean;
}): ReactElement {
	let resolvedWidth: number | undefined;
	if (width != null) {
		resolvedWidth = Number(width);
	} else if (size != null) {
		resolvedWidth = Number(size);
	} else if (height != null && aspectRatio != null) {
		resolvedWidth = Number(height) * aspectRatio;
	}

	let resolvedHeight: number | undefined;
	if (height != null) {
		resolvedHeight = Number(height);
	} else if (aspectRatio != null && resolvedWidth != null) {
		resolvedHeight = resolvedWidth / aspectRatio;
	} else if (size != null) {
		resolvedHeight = Number(size);
	}

	const rawSrc = getRawSrc(src);

	const initialSrc = rawSrc ?? fallbackSrc;
	const [imgSrc, setImgSrc] = useState<string | undefined>(initialSrc);
	const [hasError, setHasError] = useState(false);
	const [isLoaded, setIsLoaded] = useState(false);
	const [resetKey, setResetKey] = useState({ rawSrc, fallbackSrc });

	// Reset the error/loaded state during render when the requested image
	// changes (react.dev "adjusting state when props change") — one render pass,
	// no painted frame with stale src, unlike the previous effect-based reset.
	if (resetKey.rawSrc !== rawSrc || resetKey.fallbackSrc !== fallbackSrc) {
		setResetKey({ rawSrc, fallbackSrc });
		setImgSrc(rawSrc ?? fallbackSrc);
		setHasError(false);
		setIsLoaded(false);
	}

	const effectiveLoader = unoptimized ? undefined : loader;
	const { src: finalSrc, srcSet: computedSrcSet } = resolveSources(
		effectiveLoader,
		imgSrc,
		hasError,
		fill,
		resolvedWidth,
		scale,
		propSrcSet,
	);

	const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
		if (!hasError && fallbackSrc && imgSrc !== fallbackSrc) {
			setHasError(true);
			setImgSrc(fallbackSrc);
		}

		onError?.(event);
	};

	const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
		setIsLoaded(true);
		onLoad?.(event);
	};

	const combinedStyle = {
		backgroundColor: "var(--muted)",
		...(placeholderSrc && priority && !isLoaded && !hasError
			? {
					backgroundImage: `url("${placeholderSrc}")`,
					backgroundSize: "cover",
					backgroundPosition: "center",
				}
			: {}),
		...style,
	};

	return (
		<img
			ref={ref}
			src={finalSrc}
			srcSet={computedSrcSet}
			sizes={sizes}
			alt={alt}
			loading={priority ? "eager" : (loading ?? "lazy")}
			fetchPriority={priority ? "high" : "auto"}
			decoding="async"
			width={fill ? undefined : resolvedWidth}
			height={fill ? undefined : resolvedHeight}
			onError={handleError}
			onLoad={handleLoad}
			style={combinedStyle}
			className={cn(
				fill ? "absolute inset-0 size-full object-cover" : "pointer-events-none size-full select-none object-cover",
				// Priority images keep the LQIP blur-up visible (it paints this
				// element's background); lazy grids fade in over the parent surface.
				!priority && (isLoaded ? "opacity-100 transition-opacity duration-300" : "opacity-0"),
				className,
			)}
			{...props}
		/>
	);
}

export default Image;
