import { describe, expect, test } from "bun:test";
import { isPluginSearchItemRequestable, isPluginSearchItemRequested } from "@/client/utils/plugin-search-state";

describe("plugin search request state", () => {
	test("marks pending, approved and in-progress titles as requested", () => {
		expect(isPluginSearchItemRequested("pending")).toBe(true);
		expect(isPluginSearchItemRequested("approved")).toBe(true);
		expect(isPluginSearchItemRequested("in_progress")).toBe(true);
		expect(isPluginSearchItemRequested("none")).toBe(false);
		expect(isPluginSearchItemRequested("rejected")).toBe(false);
		expect(isPluginSearchItemRequested("available")).toBe(false);
	});

	test("allows requesting only missing or rejected titles", () => {
		expect(isPluginSearchItemRequestable("none")).toBe(true);
		expect(isPluginSearchItemRequestable("rejected")).toBe(true);
		expect(isPluginSearchItemRequestable("pending")).toBe(false);
		expect(isPluginSearchItemRequestable("approved")).toBe(false);
		expect(isPluginSearchItemRequestable("in_progress")).toBe(false);
		expect(isPluginSearchItemRequestable("available")).toBe(false);
	});
});
