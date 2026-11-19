/** A list page from the URL: a whole number above 1, or undefined for the first page (so "?page=1" never sticks). */
export function parsePageParam(value: unknown): number | undefined {
	const page = Number(value);

	return Number.isInteger(page) && page > 1 ? page : undefined;
}

/** validateSearch for list routes whose only param is the page. */
export function validatePageSearch(search: Record<string, unknown>): { page?: number } {
	return { page: parsePageParam(search.page) };
}
