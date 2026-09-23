export function emptyPagination(limit: number) {
	return { total: 0, page: 1, limit, totalPages: 1 };
}
