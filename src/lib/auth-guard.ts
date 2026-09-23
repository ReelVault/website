import { reelvault } from "@/client/client";

export interface CookieJar {
	has(name: string): boolean;
	get(name: string): string | undefined;
	delete?(name: string): void;
}

export interface AuthGuardOptions {
	pathname: string;
	searchParams?: URLSearchParams | Record<string, string>;
	cookies?: CookieJar;
}

let isSetupComplete = false;

export function resetSetupStatusForTesting() {
	isSetupComplete = false;
}

export function getBrowserCookies(): CookieJar {
	return {
		has(name: string): boolean {
			if (typeof document === "undefined") return false;

			return document.cookie.split(";").some((c) => c.trim().startsWith(`${name}=`));
		},
		get(name: string): string | undefined {
			if (typeof document === "undefined") return undefined;

			const prefix = `${name}=`;
			const found = document.cookie
				.split(";")
				.map((c) => c.trim())
				.find((c) => c.startsWith(prefix));

			return found ? decodeURIComponent(found.slice(prefix.length)) : undefined;
		},
		delete(name: string): void {
			if (typeof document !== "undefined") {
				// biome-ignore lint/suspicious/noDocumentCookie: synchronous cookie clearing has no platform alternative (cookieStore is async); best-effort logout cleanup
				document.cookie = `${name}=; Max-Age=0; path=/;`;
			}
		},
	};
}

const PUBLIC_PATHS = ["/auth/login", "/auth/register", "/error-cleanup", "/test"];
const AUTH_ONLY_PATHS = ["/auth/profiles"];

export async function checkAuthGuard({
	pathname,
	searchParams,
	cookies = getBrowserCookies(),
}: AuthGuardOptions): Promise<{ redirect?: string } | null> {
	if (pathname === "/setup") {
		return null;
	}

	if (!isSetupComplete) {
		try {
			const data = await reelvault.setup.getStatus();
			if (data.required) {
				const redirectUrl = new URL("/setup", "http://localhost");
				redirectUrl.searchParams.set("redirect", pathname);

				return { redirect: `${redirectUrl.pathname}${redirectUrl.search}` };
			}

			isSetupComplete = true;
		} catch {
			// API unreachable
		}
	}

	const hasSession = cookies.has("better-auth.session_token") || cookies.has("__Secure-better-auth.session_token");
	const hasProfile = cookies.has("current_profile_id");

	const getParam = (key: string): string | null => {
		if (!searchParams) return null;

		if (searchParams instanceof URLSearchParams) return searchParams.get(key);

		return searchParams[key] ?? null;
	};

	if (getParam("clear_session") === "true" || getParam("clear_profile") === "true") {
		if (getParam("clear_session") === "true") {
			cookies.delete?.("better-auth.session_token");
			cookies.delete?.("__Secure-better-auth.session_token");
		}

		cookies.delete?.("current_profile_id");
	}

	if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
		return null;
	}

	if (!hasSession) {
		const loginUrl = new URL("/auth/login", "http://localhost");
		loginUrl.searchParams.set("redirect", pathname);

		return { redirect: `${loginUrl.pathname}${loginUrl.search}` };
	}

	if (!hasProfile) {
		if (AUTH_ONLY_PATHS.some((path) => pathname.startsWith(path))) {
			return null;
		}

		const profilesUrl = new URL("/auth/profiles", "http://localhost");
		profilesUrl.searchParams.set("redirect", pathname);

		return { redirect: `${profilesUrl.pathname}${profilesUrl.search}` };
	}

	return null;
}
