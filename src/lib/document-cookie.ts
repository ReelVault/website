/**
 * Writes a raw cookie string to `document.cookie`. This is the only module that writes the property: the write has
 * to be synchronous (the Cookie Store API is async and callers need the cookie in place before they navigate), so
 * there is no platform alternative, and keeping it here confines that lint exception to one file.
 */
export function writeDocumentCookie(cookie: string): void {
	document.cookie = cookie;
}
