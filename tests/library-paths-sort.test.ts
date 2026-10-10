import { describe, expect, test } from "bun:test";
import type { LibraryWithRelations } from "@reelvault/sdk";
import { sortLibraryPaths } from "@/pages/admin/libraries/components/library-card-utils";
import { overwriteGetLocale } from "@/paraglide/runtime";

// Deterministic locale for the message lookups the helper module makes.
overwriteGetLocale(() => "en");

/**
 * A library with several source directories can be sorted by path A–Z, path Z–A or largest first.
 * The sort returns a new list and leaves the library's own list in its order.
 */

const paths = [
	{ id: "p-2", path: "/media/shows", fileCount: 40, totalSize: 900 },
	{ id: "p-1", path: "/media/movies", fileCount: 120, totalSize: 300 },
	{ id: "p-3", path: "/media/archive", fileCount: 5, totalSize: 2500 },
];

// Only `paths` is read by the helper; the rest of the library is not needed for these checks.
const library = { paths } as unknown as LibraryWithRelations;

const idsOf = (list: ReadonlyArray<{ id: string }>) => list.map((path) => path.id);

describe("source directory sort", () => {
	test("path A–Z orders the directories by their path", () => {
		expect(idsOf(sortLibraryPaths(library, "path-asc"))).toEqual(["p-3", "p-1", "p-2"]);
	});

	test("path Z–A reverses that order", () => {
		expect(idsOf(sortLibraryPaths(library, "path-desc"))).toEqual(["p-2", "p-1", "p-3"]);
	});

	test("largest first orders the directories by their total size", () => {
		expect(idsOf(sortLibraryPaths(library, "size-desc"))).toEqual(["p-3", "p-2", "p-1"]);
	});

	test("sorting returns a new list and keeps the library's own order", () => {
		sortLibraryPaths(library, "size-desc");

		expect(idsOf(library.paths)).toEqual(["p-2", "p-1", "p-3"]);
	});
});
