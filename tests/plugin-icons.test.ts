import { describe, expect, test } from "bun:test";
import { Puzzle, Shield } from "lucide-react";
import { getPluginIcon } from "../src/plugin-host/icons";

describe("getPluginIcon", () => {
	test("returns the allowlisted icon for a known name", () => {
		expect(getPluginIcon("Shield")).toBe(Shield);
	});

	test("falls back to Puzzle for a missing or empty name", () => {
		expect(getPluginIcon()).toBe(Puzzle);
		expect(getPluginIcon("")).toBe(Puzzle);
	});

	test("falls back to Puzzle for an unknown name, including names that exist on every object", () => {
		expect(getPluginIcon("NotAnIcon")).toBe(Puzzle);
		expect(getPluginIcon("constructor")).toBe(Puzzle);
		expect(getPluginIcon("__proto__")).toBe(Puzzle);
	});
});
