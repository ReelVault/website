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
export async function ensureAuthenticated(context: RouterContext, { requireProfile = true }: { requireProfile?: boolean } = {}) {
	try {
		const me = await context.queryClient.query(currentProfileQueryOptions());
		if (!me.user) {
			redirect({ to: "/auth/login", replace: true, throw: true });
		}

		if (requireProfile && !me.profile) {
			redirect({ to: "/auth/profiles", replace: true, throw: true });
		}
	} catch (error) {
		if (isRedirect(error)) throw error;

		redirect({ to: "/auth/login", replace: true, throw: true });
	}
}
