const SHORTCUTS_DISABLED_COOKIE_NAME = "reelvault_player_shortcuts_disabled";
const SHORTCUTS_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function getShortcutsDisabledCookie(): boolean {
	if (typeof document === "undefined") return false;

	try {
		const match = document.cookie.match(new RegExp(`(?:^|; )${SHORTCUTS_DISABLED_COOKIE_NAME}=([^;]*)`));

		return match ? match[1] === "true" : false;
	} catch {
		return false;
	}
}

export function setShortcutsDisabledCookie(disabled: boolean): void {
	if (typeof document === "undefined") return;

	try {
		// biome-ignore lint/suspicious/noDocumentCookie: cookie persistence for player settings
		document.cookie = `${SHORTCUTS_DISABLED_COOKIE_NAME}=${disabled}; path=/; max-age=${SHORTCUTS_COOKIE_MAX_AGE}; SameSite=Lax`;
	} catch {
		// ignore cookie errors
	}
}
