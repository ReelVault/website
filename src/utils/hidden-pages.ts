/** Optional menu pages a profile can hide; each id is the `pageId` of the menu entries that show that page. */
export const OPTIONAL_PAGE_IDS = ["collections", "discovery", "insights", "devices", "remote"] as const;

export type OptionalPageId = (typeof OPTIONAL_PAGE_IDS)[number];

/** Reads the stored comma-separated list of hidden page ids. */
export function parseHiddenPages(value: string): ReadonlySet<string> {
	return new Set(
		value
			.split(",")
			.map((page) => page.trim())
			.filter((page) => page.length > 0),
	);
}

/** Drops the menu entries whose optional page the profile hides; entries without a `pageId` always stay. */
export function filterHiddenPages<T extends { pageId?: OptionalPageId }>(entries: readonly T[], hiddenPages: ReadonlySet<string>): T[] {
	return entries.filter((entry) => entry.pageId === undefined || !hiddenPages.has(entry.pageId));
}
