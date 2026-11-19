/** FormData.get returns `string | File | null`; only plain string fields are
 * meaningful here, so anything else is treated as missing. */
export function getFormValue(data: FormData, key: string): string {
	const value = data.get(key);

	return typeof value === "string" ? value : "";
}

const QUICK_CONNECT_CODE_LENGTH = 6;

/** Input length of a formatted code: the characters plus the dash. */
export const QUICK_CONNECT_INPUT_MAX_LENGTH = QUICK_CONNECT_CODE_LENGTH + 1;

function quickConnectCodeChars(value: string): string {
	return value.replace(/[^0-9a-zA-Z]/g, "").toUpperCase();
}

/** Formats a Quick Connect code as XXX-XXX while typing (alphanumeric, uppercased).
 * The dash never blocks the real 6-character code the server generates. */
export function formatQuickConnectCode(value: string): string {
	const raw = quickConnectCodeChars(value).slice(0, QUICK_CONNECT_CODE_LENGTH);

	return raw.length > 3 ? `${raw.slice(0, 3)}-${raw.slice(3)}` : raw;
}

/** True once a typed code has every character the server generates. */
export function isCompleteQuickConnectCode(value: string): boolean {
	return quickConnectCodeChars(value).length === QUICK_CONNECT_CODE_LENGTH;
}
