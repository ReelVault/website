import { ReelVaultError } from "@reelvault/sdk/client";
import { isRedirect, redirect } from "@tanstack/react-router";
import { currentProfileQueryOptions } from "@/client/hooks/use-current-profile";
import type { RouterContext } from "./__root";

/**
 * Router-level auth guard: resolves the cached current-user query (one request
 * max) *before* the route renders, so protected deep links redirect instead of
 * flashing a loading screen. `RequireAuth` in the layouts stays as a live
 * fallback for in-app session invalidation (it only sees cache updates after
 * render, which is fine there).
 */
export async function ensureAuthenticated(context: RouterContext) {
	try {
		const me = await context.queryClient.query(currentProfileQueryOptions());
		if (!me.user) {
			redirect({ to: "/auth/login", replace: true, throw: true });
		}

		if (!me.profile) {
			redirect({ to: "/auth/profiles", replace: true, throw: true });
		}
	} catch (error) {
		if (isRedirect(error)) throw error;

		// Only an auth rejection means "signed out". A timeout/5xx is a server
		// problem and must not silently bounce a user with a valid session to
		// the login page.
		if (error instanceof ReelVaultError && (error.status === 401 || error.status === 403)) {
			redirect({ to: "/auth/login", replace: true, throw: true });
		}

		throw error;
	}
}
