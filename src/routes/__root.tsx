import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet, redirect } from "@tanstack/react-router";
import { reelvault } from "@/client/client";
import { TanStackDevtools } from "@/components/dev/tanstack-devtools";
import { NotFoundScreen } from "@/components/router/not-found-screen";
import { RouteErrorScreen } from "@/components/router/route-error-screen";
import { RouteProgressBar } from "@/components/router/route-progress-bar";
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

		const data = await reelvault.setup.getStatus();
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
