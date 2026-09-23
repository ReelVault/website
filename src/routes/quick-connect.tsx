import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const QuickConnectPage = lazyRouteComponent(() => import("@/pages/auth/quick-connect/quick-connect-page"));

// zod-free validateSearch — see src/types/search-params.ts for the rationale.
interface QuickConnectSearch {
	code?: string;
	redeem?: string;
}

function quickConnectSearchValidator(search: Record<string, unknown>): QuickConnectSearch {
	return {
		code: typeof search.code === "string" ? search.code : undefined,
		redeem: typeof search.redeem === "string" ? search.redeem : undefined,
	};
}

export const Route = createFileRoute("/quick-connect")({
	component: QuickConnectPage,
	validateSearch: quickConnectSearchValidator,
});
