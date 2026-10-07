export interface MetadataImageHolder {
	images?: Array<{
		imageType: string;
		data?: {
			id: string;
			updatedAt?: string | Date;
		} | null;
	}> | null;
}

export function getMetadataPoster(item?: MetadataImageHolder | null) {
	return item?.images?.find((img) => img.imageType === "poster")?.data;
}

export function getMetadataBackdrop(item?: MetadataImageHolder | null) {
	return item?.images?.find((img) => img.imageType === "backdrop")?.data;
}

/** Server image URLs are `/v1/images/<id>`; accept a version prefix so a future v2 keeps working. */
const IMAGE_ID_URL_REGEX = /\/v\d+\/images\/([^/?#]+)/;

export function extractFileIdFromUrl(url: string | null | undefined): string | null {
	if (!url) return null;

	const match = url.match(IMAGE_ID_URL_REGEX);

	return match?.[1] ?? null;
}
