import { QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { LoadingScreen } from "./components/loading-screen";
import { NotFoundScreen } from "./components/router/not-found-screen";
import { RouteErrorScreen } from "./components/router/route-error-screen";
import { installLocalErrorReporting } from "./lib/local-error-reporting";
import { queryClient } from "./lib/query-client";
import { routeTree } from "./routeTree.gen";
import { parseSearchParams, stringifySearchParams } from "./types/search-params";
import { silenceSkippedViewTransitions } from "./utils/view-transition-rejections";

silenceSkippedViewTransitions();
installLocalErrorReporting();

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
	defaultPendingComponent: LoadingScreen,
	defaultPendingMs: 250,
	defaultPendingMinMs: 500,
	parseSearch: parseSearchParams,
	stringifySearch: stringifySearchParams,
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById("root");
if (rootElement && !rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement, {
		onUncaughtError: (error, errorInfo) => {
			console.error("[ReelVault] Uncaught React error", error, errorInfo.componentStack);
		},
		onCaughtError: (error, errorInfo) => {
			console.error("[ReelVault] Caught React error", error, errorInfo.componentStack);
		},
		onRecoverableError: (error, errorInfo) => {
			console.error("[ReelVault] Recoverable React error", error, errorInfo.componentStack);
		},
	});
	root.render(
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
			</QueryClientProvider>
		</StrictMode>,
	);
}
