import type { ComponentProps } from "react";
import { getReelVaultApiUrl } from "@/client/client";
import { Image, type ImageLoaderProps } from "./image";

const IMAGE_SUPPORTED_WIDTHS = [32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1000, 1080, 1200, 1500, 1920] as const;

function snapToSupportedWidth(targetWidth: number): number {
	const rounded = Math.round(targetWidth);
	const maxSupportedWidth = IMAGE_SUPPORTED_WIDTHS[IMAGE_SUPPORTED_WIDTHS.length - 1] ?? IMAGE_SUPPORTED_WIDTHS[0];

	return IMAGE_SUPPORTED_WIDTHS.find((w) => w >= rounded) ?? maxSupportedWidth;
}

export function buildImageUrl(
	fileId: string | null | undefined,
	options?: {
		width?: number;
		height?: number;
		quality?: number;
		cacheKey?: string | number | Date | null;
	},
): string | null {
	if (!fileId) return null;

	const url = new URL(`/v1/images/${encodeURIComponent(fileId)}`, getReelVaultApiUrl());

	if (options?.cacheKey != null) {
		url.searchParams.set("v", String(options.cacheKey));
	}

	if (options?.width) {
		const snappedWidth = snapToSupportedWidth(options.width);
		url.searchParams.set("width", String(snappedWidth));
		url.searchParams.set("w", String(snappedWidth));
	}

	if (options?.height) {
		const snappedHeight = snapToSupportedWidth(options.height);
		url.searchParams.set("height", String(snappedHeight));
	}

	if (options?.quality) {
		url.searchParams.set("quality", String(options.quality));
		url.searchParams.set("q", String(options.quality));
	}

	return url.toString();
}

export function apiImageLoader({ src, width, quality }: ImageLoaderProps): string {
	if (!src.includes("/v1/images/")) return src;

	try {
		const url = new URL(src, window.location.origin);
		const snapped = snapToSupportedWidth(width);
		url.searchParams.set("width", String(snapped));
		url.searchParams.set("w", String(snapped));
		if (quality) {
			url.searchParams.set("quality", String(quality));
			url.searchParams.set("q", String(quality));
		}

		return url.toString();
	} catch {
		return src;
	}
}

export function ApiImage({
	fileId,
	cacheKey,
	placeholder = true,
	...props
}: Omit<ComponentProps<typeof Image>, "src"> & {
	fileId: string | undefined | null;
	cacheKey?: string | number | Date | null;
	placeholder?: boolean;
}) {
	let width = 500;
	if (props.width) {
		width = Number(props.width);
	} else if (props.fill) {
		width = 1080;
	}

	const source = fileId && buildImageUrl(fileId, { width, cacheKey });
	const placeholderSrc = placeholder && fileId ? buildImageUrl(fileId, { width: 32, quality: 45, cacheKey }) : undefined;

	return <Image src={source} placeholderSrc={placeholderSrc} loader={apiImageLoader} {...props} />;
}
