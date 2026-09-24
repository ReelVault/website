import { describe, expect, it } from "bun:test";
import { coerceSearchBoolean, parseSearchParams, stringifySearchParams } from "@/types/search-params";

describe("search param serialization", () => {
	it("keeps plain string values unquoted", () => {
		expect(stringifySearchParams({ yearFrom: "1901", genreMode: "true", q: "matrix" })).toBe("?yearFrom=1901&genreMode=true&q=matrix");
	});

	it("round-trips plain values as strings", () => {
		const parsed = parseSearchParams("?yearFrom=1901&genreMode=true&page=2");
		expect(parsed).toEqual({ yearFrom: "1901", genreMode: "true", page: "2" });
	});

	it("reads back the previous JSON-quoted form", () => {
		const parsed = parseSearchParams("?yearFrom=%221901%22&genreMode=%22true%22");
		expect(parsed).toEqual({ yearFrom: "1901", genreMode: "true" });
	});

	it("skips empty values and appends arrays as repeated params", () => {
		expect(stringifySearchParams({ q: "", tags: ["a", "b"] })).toBe("?tags=a&tags=b");
		expect(parseSearchParams("?tags=a&tags=b")).toEqual({ tags: ["a", "b"] });
	});

	it("coerces boolean spellings without treating other strings as booleans", () => {
		expect(coerceSearchBoolean("true")).toBe(true);
		expect(coerceSearchBoolean("false")).toBe(false);
		expect(coerceSearchBoolean("0")).toBe(false);
		expect(coerceSearchBoolean("")).toBe(false);
		expect(coerceSearchBoolean(undefined)).toBeUndefined();
		expect(coerceSearchBoolean(true)).toBe(true);
	});
});
