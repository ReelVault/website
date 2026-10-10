import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * The shared button keeps a fixed height from the small breakpoint up (`sm:h-8`, `sm:h-7`, `sm:h-9`). A bare
 * `h-auto` on a button is overridden there, so its content spills out of the box. Every class string that sets a
 * bare `h-auto` must also set `sm:h-auto`. Variant-prefixed classes such as `has-[...]:h-auto` are not counted.
 */

const SRC = join(import.meta.dir, "..", "src");
const BARE_H_AUTO = /(?<![\w:[-])h-auto(?![\w-])/;
const SM_H_AUTO = /(?<![\w:[-])sm:h-auto(?![\w-])/;
const STRING_LITERAL = /"([^"\n]*)"/g;

function tsxFiles(dir: string): string[] {
	return readdirSync(dir).flatMap((name) => {
		const path = join(dir, name);
		if (statSync(path).isDirectory()) return tsxFiles(path);
		return name.endsWith(".tsx") ? [path] : [];
	});
}

describe("responsive height guard", () => {
	test("every class string with a bare h-auto also sets sm:h-auto", () => {
		const offenders: string[] = [];
		for (const file of tsxFiles(SRC)) {
			const source = readFileSync(file, "utf8");
			for (const match of source.matchAll(STRING_LITERAL)) {
				const literal = match[1] ?? "";
				if (BARE_H_AUTO.test(literal) && !SM_H_AUTO.test(literal)) {
					offenders.push(`${relative(SRC, file)}: ${literal.slice(0, 90)}`);
				}
			}
		}
		expect(offenders).toEqual([]);
	});
});
