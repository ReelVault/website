import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet, redirect } from "@tanstack/react-router";
import { reelvault } from "@/client/client";
import { TanStackDevtools } from "@/components/dev/tanstack-devtools";
import { NotFoundScreen } from "@/components/router/not-found-screen";
import { RouteErrorScreen } from "@/components/router/route-error-screen";
import { RouteProgressBar } from "@/components/router/route-progress-bar";
import { withTimeout } from "@/lib/with-timeout";
import { RootLayout } from "@/pages/root-layout";

export interface RouterContext {
	queryClient: QueryClient;
}

let isSetupComplete = false;
const SETUP_COMPLETE_STORAGE_KEY = "reelvault:setup:complete";

export const Route = createRootRouteWithContext<RouterContext>()({
	beforeLoad: async ({ location }) => {
		if (location.pathname === "/setup") return;

		if (isSetupComplete) return;

		// A stored flag skips the blocking getStatus round-trip on every full page
		// reload; only the first load of a browser session waits for the server.
		// A mid-session re-setup is picked up on the next session (accepted flash).
		try {
			if (sessionStorage.getItem(SETUP_COMPLETE_STORAGE_KEY) === "1") {
				isSetupComplete = true;

				return;
			}
		} catch {
			// sessionStorage unavailable (privacy mode) — fall through to the check
		}

		// Do not leave the whole app on a blank screen for the SDK's full 30 s
		// timeout (plus retry) when the server is unreachable.
		const data = await withTimeout(reelvault.setup.getStatus(), 10_000, "setup status");
		if (data.required) {
			redirect({
				to: "/setup",
				throw: true,
			});
		}

		isSetupComplete = true;
		try {
			sessionStorage.setItem(SETUP_COMPLETE_STORAGE_KEY, "1");
		} catch {
			// ignore
		}
	},
	component: Layout,
	notFoundComponent: NotFoundScreen,
	errorComponent: RouteErrorScreen,
});

function Layout() {
	return (
		<RootLayout>
			<RouteProgressBar />
			<Outlet />
			<TanStackDevtools />
		</RootLayout>
	);
}
