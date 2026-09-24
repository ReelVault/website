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

/**
 * URL search serialization without JSON quoting. The router default
 * (`stringifySearchWith(JSON.stringify, JSON.parse)`) encodes string values as
 * `?yearFrom="1901"`, which is valid but noisy. Values round-trip as plain
 * strings here; booleans are the only coerced scalar (`collection=false`), so
 * route validators that read strings keep working unchanged.
 */
export function parseSearchParams(searchStr: string): Record<string, unknown> {
	const params = new URLSearchParams(searchStr);
	const result: Record<string, unknown> = {};
	for (const [key, value] of params) {
		const decoded = decodeJsonQuotedString(value);
		const existing = result[key];
		if (existing === undefined) {
			result[key] = decoded;
		} else if (Array.isArray(existing)) {
			existing.push(decoded);
		} else {
			result[key] = [existing, decoded];
		}
	}

	return result;
}

export function stringifySearchParams(search: Record<string, unknown>): string {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(search)) {
		if (value === undefined || value === null || value === "") continue;

		if (Array.isArray(value)) {
			for (const item of value) params.append(key, stringifySearchValue(item));
		} else {
			params.set(key, stringifySearchValue(value));
		}
	}

	const query = params.toString();

	return query ? `?${query}` : "";
}

function stringifySearchValue(value: unknown): string {
	if (typeof value === "object") return JSON.stringify(value);

	if (typeof value === "string") return value;

	if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") return String(value);

	if (typeof value === "symbol") return value.toString();

	return "";
}

/**
 * Booleans as strings for route validators. `Boolean("false")` is `true`, so
 * coerce the two canonical spellings explicitly before falling back.
 */
export function coerceSearchBoolean(value: unknown): boolean | undefined {
	if (value === undefined) return undefined;

	if (typeof value === "boolean") return value;

	if (typeof value === "string") return value !== "false" && value !== "0" && value !== "";

	return Boolean(value);
}

/** Reads back values written by the previous JSON-quoting serializer. */
function decodeJsonQuotedString(raw: string): string {
	if (raw.length >= 2 && raw.startsWith('"') && raw.endsWith('"')) {
		try {
			const parsed: unknown = JSON.parse(raw);
			if (typeof parsed === "string") return parsed;
		} catch {
			// Not JSON after all — keep the raw value.
		}
	}

	return raw;
}
