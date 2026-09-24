import { QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { NotFoundScreen } from "./components/router/not-found-screen";
import { RouteErrorScreen } from "./components/router/route-error-screen";
import { queryClient } from "./lib/query-client";
import { routeTree } from "./routeTree.gen";
import { parseSearchParams, stringifySearchParams } from "./types/search-params";

// Create a new router instance with production-grade defaults
const router = createRouter({
	routeTree,
	context: {
		queryClient,
	},
	defaultPreload: "intent",
	defaultPreloadStaleTime: 0,
	scrollRestoration: true,
	defaultViewTransition: true,
	defaultNotFoundComponent: NotFoundScreen,
	defaultErrorComponent: RouteErrorScreen,
	parseSearch: parseSearchParams,
	stringifySearch: stringifySearchParams,
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

if (import.meta.env.DEV) {
	const { scan } = await import("react-scan");
	scan({ enabled: true });
}

const rootElement = document.getElementById("root");
if (rootElement && !rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
			</QueryClientProvider>
		</StrictMode>,
	);
}
