import { describe, expect, it } from "bun:test";
import { extractFileIdFromUrl } from "@/utils/metadata-utils";

describe("extractFileIdFromUrl", () => {
	it("extracts the image id from a server image URL", () => {
		expect(extractFileIdFromUrl("/v1/images/abc-123")).toBe("abc-123");
		expect(extractFileIdFromUrl("http://host/v1/images/abc-123")).toBe("abc-123");
	});

	it("stops at the query string", () => {
		expect(extractFileIdFromUrl("/v1/images/abc-123?width=500&quality=80")).toBe("abc-123");
	});

	it("returns null for missing or non-image URLs", () => {
		expect(extractFileIdFromUrl(null)).toBeNull();
		expect(extractFileIdFromUrl(undefined)).toBeNull();
		expect(extractFileIdFromUrl("/v1/media-files/mf-1/artifacts/art-1")).toBeNull();
	});
});
