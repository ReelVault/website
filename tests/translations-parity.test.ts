import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The English and Polish catalogues must describe the same messages with the same
 * placeholders. A translation that drops `{field}` would render a sentence with a hole
 * where the server's parameter belongs, so placeholder sets must match key by key.
 */

const MESSAGES = join(import.meta.dir, "..", "messages");

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function readCatalogue(locale: string): Record<string, unknown> {
	const parsed: unknown = JSON.parse(readFileSync(join(MESSAGES, `${locale}.json`), "utf8"));
	if (!isRecord(parsed)) throw new Error(`${locale}.json must hold a JSON object`);

	return parsed;
}

const en = readCatalogue("en");
const pl = readCatalogue("pl");

const placeholders = (value: unknown): string[] =>
	[...new Set([...JSON.stringify(value).matchAll(/\{(\w+)\}/g)].map((match) => match[1] ?? ""))].toSorted();

describe("translation catalogues", () => {
	test("both locales define exactly the same keys", () => {
		expect(Object.keys(en).filter((key) => !(key in pl))).toEqual([]);
		expect(Object.keys(pl).filter((key) => !(key in en))).toEqual([]);
	});

	test("every key has the same placeholders in English and Polish", () => {
		const mismatches = Object.keys(en).filter((key) => JSON.stringify(placeholders(en[key])) !== JSON.stringify(placeholders(pl[key])));

		expect(mismatches).toEqual([]);
	});

	test("no message is empty", () => {
		const offenders = [...Object.entries(en), ...Object.entries(pl)].filter(
			([, value]) => typeof value === "string" && value.trim() === "",
		);

		expect(offenders).toEqual([]);
	});
});
