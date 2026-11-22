import { describe, expect, test } from "bun:test";
import { formatRecommendationReason, recommendationReasonMap } from "@/pages/web/discovery/utils/recommendation-reason";
import { overwriteGetLocale } from "@/paraglide/runtime";

// Deterministic locale for the message lookups below.
overwriteGetLocale(() => "en");

describe("recommendation reason text", () => {
	test("a shared crew credit shows the provider's job name and the person", () => {
		expect(formatRecommendationReason({ metadataId: "m1", kind: "credit", label: "Christopher Nolan", role: "Director" })).toBe(
			"Director: Christopher Nolan",
		);
	});

	test("a crew credit without a job name reads like a shared person", () => {
		expect(formatRecommendationReason({ metadataId: "m1", kind: "credit", label: "Christopher Nolan" })).toBe("With Christopher Nolan");
	});

	test("a close watched title names that title", () => {
		expect(formatRecommendationReason({ metadataId: "m1", kind: "seed", label: "Arrival", seedId: "m0" })).toBe(
			"Because you watched Arrival",
		);
	});

	test("a cold-start pick says it is popular in the library", () => {
		expect(formatRecommendationReason({ metadataId: "m1", kind: "popular" })).toBe("Popular in your library");
	});

	test("a labelled kind without its label falls back to the generic match text", () => {
		expect(formatRecommendationReason({ metadataId: "m1", kind: "keyword" })).toBe("Matches your taste");
	});

	test("maps every reason to its title id", () => {
		const map = recommendationReasonMap([
			{ metadataId: "m1", kind: "collection", label: "The Dark Knight Collection" },
			{ metadataId: "m2", kind: "person", label: "Keanu Reeves" },
		]);

		expect([...map]).toEqual([
			["m1", "More from The Dark Knight Collection"],
			["m2", "With Keanu Reeves"],
		]);
	});
});
