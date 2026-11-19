export function emptyPagination(limit: number) {
	return { total: 0, page: 1, limit, totalPages: 0 };
}

/** An empty filter means "no filter": the API must not receive `?q=`. */
export function emptyToUndefined(value: string | undefined): string | undefined {
	return value === "" ? undefined : value;
}
