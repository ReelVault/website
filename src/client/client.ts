import { ReelVaultClient } from "@reelvault/sdk/client";
import { queryClient } from "@/lib/query-client";
import { authKeys } from "./utils/query-keys";

const IPV4_ADDRESS_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;

/**
 * Returns true when the given hostname is a raw IP address (IPv4 or IPv6).
 * Used to distinguish "accessed via IP" from "accessed via domain name".
 */
function isIpAddress(hostname: string): boolean {
	if (IPV4_ADDRESS_REGEX.test(hostname)) return true;

	if (hostname === "::1" || hostname === "[::1]") return true;

	return false;
}

/**
 * Resolves the backend API URL dynamically:
 * - If VITE_REELVAULT_API_URL starts with `/`, used as-is (relative path proxy).
 * - If accessed via a proper domain name (e.g. rv.lan, rv.domena.pl), constructs
 *   `${protocol}//api.${hostname}` — so the API is always on the `api.*` subdomain.
 * - If accessed via localhost or a raw IP address, falls back to `hostname:3030`.
 */
function getEnvApiUrl(): string | undefined {
	try {
		const url = import.meta.env.VITE_REELVAULT_API_URL;
		if (url) return url;
	} catch {
		// import.meta may be unavailable outside Vite-backed runtimes — treat as unset.
	}

	return undefined;
}

/**
 * True when this page was served by the ReelVault server itself (the server
 * injects the marker into index.html). The API then lives on the same origin —
 * deterministic, unlike the api.*-subdomain / port-3030 heuristics, which miss
 * single-port hosting behind a reverse proxy.
 */
function isSameOriginHosting(): boolean {
	if (typeof document === "undefined") return false;

	return document.querySelector<HTMLMetaElement>('meta[name="reelvault-api-origin"]')?.content === "same-origin";
}

export function getReelVaultApiUrl(): string {
	if (typeof window !== "undefined") {
		// Single-port hosting: the server served this page, so it also serves /v1 here.
		if (isSameOriginHosting()) return window.location.origin;

		const envUrl = getEnvApiUrl();
		if (envUrl) {
			if (envUrl.startsWith("/")) return envUrl;

			try {
				const parsed = new URL(envUrl, window.location.origin);
				const isEnvLocalhost = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
				const isWindowLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
				const isWindowIp = isIpAddress(window.location.hostname);

				// Env points to a non-local host but browser is on localhost → keep env URL (dev override)
				if (!isEnvLocalhost && isWindowLocalhost) {
					return envUrl;
				}

				// Env points to localhost but browser is on a real host
				if (isEnvLocalhost && !isWindowLocalhost) {
					if (isWindowIp) {
						// IP-based access: use the same port as the env URL
						const port = parsed.port || "3030";

						return `${window.location.protocol}//${window.location.hostname}:${port}`;
					}

					// Domain-based access: use the api.* subdomain (standard HTTPS port)
					return `${window.location.protocol}//api.${window.location.hostname}`;
				}

				return envUrl;
			} catch {
				// Malformed env URL — fall through to the host-derived default below.
			}
		}

		// No env URL configured: derive the API URL from the current browser host.
		const hostname = window.location.hostname;
		const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
		if (isLocalhost || isIpAddress(hostname)) {
			// localhost / raw IP → port-based fallback
			return `${window.location.protocol}//${hostname}:3030`;
		}

		// Proper domain (rv.lan, rv.domena.pl, …) → api subdomain
		return `${window.location.protocol}//api.${hostname}`;
	}

	return getEnvApiUrl() ?? "http://localhost:3030";
}

/**
 * Resolves a server-relative asset path (e.g. `/v1/images/<id>`) against the API
 * origin, so it can be used directly as an <img> src. Absolute URLs (Dicebear,
 * data:, blob:) pass through unchanged.
 */
export function resolveApiAssetUrl(url: string | null | undefined): string | undefined {
	if (!url) return undefined;

	if (!url.startsWith("/")) return url;

	try {
		return new URL(url, getReelVaultApiUrl()).toString();
	} catch {
		return url;
	}
}

export const reelvault = new ReelVaultClient({
	baseUrl: () => getReelVaultApiUrl(),
	credentials: "include",
	// The SDK owns transient-failure retries (network/timeout/5xx/429) with its
	// own backoff. The default of 3 multiplies with React Query's own retry into
	// up to ~8 attempts per request on flaky links; one SDK retry plus the
	// query-level predicate below keeps the total bounded while preserving the
	// transient-recovery behavior.
	maxRetries: 1,
	fetcher: async (url, init) => {
		const response = await fetch(url, {
			...init,
			credentials: "include",
			cache: "no-store",
		});
		if (response.status === 401) handleUnauthorized(url);

		return response;
	},
});

let unauthorizedRedirecting = false;

/**
 * Mid-session session expiry: a 401 on a protected endpoint while a user was
 * believed signed in. Auth endpoints legitimately return 401 (login, `me` when
 * signed out) and public pages must not bounce, so those are excluded. The
 * router guard only runs on navigation — this covers background queries.
 */
function handleUnauthorized(requestUrl: string): void {
	if (typeof window === "undefined") return;

	let pathname: string;
	try {
		pathname = new URL(requestUrl, window.location.origin).pathname;
	} catch {
		return;
	}

	if (pathname.startsWith("/v1/auth/")) return;

	if (window.location.pathname.startsWith("/auth/")) return;

	const me = queryClient.getQueryData<{ user?: unknown }>(authKeys.me());
	if (me?.user == null) return;

	if (unauthorizedRedirecting) return;

	unauthorizedRedirecting = true;
	queryClient.removeQueries({ queryKey: authKeys.me() });
	window.location.assign("/auth/login");
}
