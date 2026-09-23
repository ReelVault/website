import { m } from "@/paraglide/messages";

/**
 * Static maps of the server's client/browser/os codes (parsed from the user
 * agent in the live-sessions service) to their messages. Keys are hardcoded —
 * no message key may be constructed dynamically, so the unused-key script can
 * always verify usage statically.
 */
const CLIENT_LABELS: Record<string, () => string> = {
	android_mobile: m.client_android_mobile,
	android_tv: m.client_android_tv,
	apple_ios: m.client_apple_ios,
	apple_mac: m.client_apple_mac,
	linux_pc: m.client_linux_pc,
	unknown: m.client_unknown,
	web: m.client_web,
	windows_pc: m.client_windows_pc,
};

const BROWSER_LABELS: Record<string, () => string> = {
	chrome: m.browser_chrome,
	edge: m.browser_edge,
	firefox: m.browser_firefox,
	safari: m.browser_safari,
	unknown: m.browser_unknown,
	web: m.browser_web,
};

const OS_LABELS: Record<string, () => string> = {
	android: m.os_android,
	ios: m.os_ios,
	linux: m.os_linux,
	macos: m.os_macos,
	unknown: m.os_unknown,
	windows: m.os_windows,
};

function localizedLabel(labels: Record<string, () => string>, code: string | null | undefined): string {
	if (!code) return "—";

	const translated = labels[code]?.();
	// An unknown code falls back to the raw code, then to the dash.
	if (translated !== undefined && translated.length > 0) return translated;

	return code.length > 0 ? code : "—";
}

export function clientLabel(code: string | null | undefined): string {
	return localizedLabel(CLIENT_LABELS, code);
}

export function browserLabel(code: string | null | undefined): string {
	return localizedLabel(BROWSER_LABELS, code);
}

export function osLabel(code: string | null | undefined): string {
	return localizedLabel(OS_LABELS, code);
}

export function formatStreamTime(totalSecs: number): string {
	const hours = Math.floor(totalSecs / 3600);
	const mins = Math.floor((totalSecs % 3600) / 60);
	const secs = totalSecs % 60;

	return hours > 0
		? `${hours}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
		: `${mins}:${String(secs).padStart(2, "0")}`;
}
