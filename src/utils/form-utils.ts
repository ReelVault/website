/** FormData.get returns `string | File | null`; only plain string fields are
 * meaningful here, so anything else is treated as missing. */
export function getFormValue(data: FormData, key: string): string {
	const value = data.get(key);

	return typeof value === "string" ? value : "";
}

/** Formats a Quick Connect code as XXX-XXX while typing (alphanumeric, uppercased).
 * The dash never blocks the real 6-character code the server generates. */
export function formatQuickConnectCode(value: string): string {
	const raw = value
		.replace(/[^0-9a-zA-Z]/g, "")
		.toUpperCase()
		.slice(0, 6);

	return raw.length > 3 ? `${raw.slice(0, 3)}-${raw.slice(3)}` : raw;
}
