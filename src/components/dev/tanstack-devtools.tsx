/**
 * Dev-only floating panels for TanStack Query and Router state. Mounted from
 * the root route, which sits inside both QueryClientProvider and the router
 * context. The DEV guard is statically replaced at build time, so the dynamic
 * imports (and their chunks) are eliminated from production bundles.
 */
import { lazy, Suspense } from "react";

const ReactQueryDevtools = import.meta.env.DEV
	? lazy(async () => {
			const mod = await import("@tanstack/react-query-devtools");

			return { default: mod.ReactQueryDevtools };
		})
	: null;

const TanStackRouterDevtools = import.meta.env.DEV
	? lazy(async () => {
			const mod = await import("@tanstack/react-router-devtools");

			return { default: mod.TanStackRouterDevtools };
		})
	: null;

export function TanStackDevtools() {
	if (!(import.meta.env.DEV && ReactQueryDevtools && TanStackRouterDevtools)) return null;

	return (
		<Suspense fallback={null}>
			<ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" position="right" />
			<TanStackRouterDevtools initialIsOpen={false} position="bottom-left" />
		</Suspense>
	);
}
