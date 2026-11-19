/** Query-string keys the library filters own (see use-library-logic); absent keys mean "default". */
const LIBRARY_SEARCH_KEYS = [
	"q",
	"sortBy",
	"sortOrder",
	"yearFrom",
	"yearTo",
	"genres",
	"durationMin",
	"durationMax",
	"watched",
	"rating",
	"genreMode",
	"genreIndex",
	"letter",
] as const;

type LibrarySearch = Partial<Record<(typeof LIBRARY_SEARCH_KEYS)[number], string>>;

/** Shared by the /movies and /series routes so the router types search updates from the filters hook. */
export function validateLibrarySearch(search: Record<string, unknown>): LibrarySearch {
	const result: LibrarySearch = {};
	for (const key of LIBRARY_SEARCH_KEYS) {
		const value = search[key];
		if (typeof value === "string") result[key] = value;
	}

	return result;
}
