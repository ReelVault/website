import { describe, expect, test } from "bun:test";
import { m } from "@/paraglide/messages";
import { overwriteGetLocale } from "@/paraglide/runtime";

/**
 * The purge warning marks the words that are kept in bold with the markup syntax. The dialog renders that
 * markup; a value passed in as a function instead of markup used to show the function's source text.
 */

const textOf = (parts: ReadonlyArray<{ type: string; value?: string }>) =>
	parts
		.filter((part) => part.type === "text")
		.map((part) => part.value ?? "")
		.join("");

describe("purge history warning", () => {
	test("the English warning marks the kept words as strong markup and shows no function source", () => {
		overwriteGetLocale(() => "en");
		const parts = m.admin_worker_purge_irreversible_warning.parts({});

		expect(parts.some((part) => part.type === "markup-start" && part.name === "strong")).toBe(true);
		expect(parts.some((part) => part.type === "markup-end" && part.name === "strong")).toBe(true);
		expect(textOf(parts)).toContain("will not be");
		expect(textOf(parts)).not.toContain("function");
	});

	test("the Polish warning marks the kept words as strong markup too", () => {
		overwriteGetLocale(() => "pl");
		const parts = m.admin_worker_purge_irreversible_warning.parts({});

		expect(parts.some((part) => part.type === "markup-start" && part.name === "strong")).toBe(true);
		expect(textOf(parts)).toContain("nie zostaną");
		overwriteGetLocale(() => "en");
	});
});
