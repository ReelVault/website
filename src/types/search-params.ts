// zod-free on purpose: route modules are part of the eager startup graph, so a
// top-level zod import here would put the whole zod/mini chunk into first
// paint. These validators mirror the previous z.compile(z.object(...)) output —
// string values pass through, anything else drops (the router then omits them).
export interface RedirectSearch {
	redirect?: string;
}

export function redirectSearchValidator(search: Record<string, unknown>): RedirectSearch {
	return typeof search.redirect === "string" ? { redirect: search.redirect } : {};
}
