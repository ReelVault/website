import { describe, expect, it } from "bun:test";
import { filterHiddenPages, type OptionalPageId, parseHiddenPages } from "@/utils/hidden-pages";

describe("hidden pages", () => {
	it("parses the stored list and ignores blank entries", () => {
		expect([...parseHiddenPages(" collections, ,remote ")]).toEqual(["collections", "remote"]);
		expect(parseHiddenPages("").size).toBe(0);
	});

	it("drops entries whose page is hidden and keeps entries without a page id", () => {
		const entries: Array<{ label: string; pageId?: OptionalPageId }> = [
			{ label: "Dashboard" },
			{ label: "Collections", pageId: "collections" },
			{ label: "Remote", pageId: "remote" },
		];

		expect(filterHiddenPages(entries, new Set(["remote"]))).toEqual([
			{ label: "Dashboard" },
			{ label: "Collections", pageId: "collections" },
		]);
	});
});
