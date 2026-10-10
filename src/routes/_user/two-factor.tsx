import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const TwoFactorPage = lazyRouteComponent(() => import("@/pages/user/two-factor/two-factor-page"));

// zod-free validateSearch — see src/types/search-params.ts for the rationale.
// "enable" turns 2FA on (password → scan → backup codes); "regenerate" only issues new backup codes.
type TwoFactorMode = "enable" | "regenerate";

function twoFactorSearchValidator(search: Record<string, unknown>): { mode: TwoFactorMode } {
	return { mode: search.mode === "regenerate" ? "regenerate" : "enable" };
}

export const Route = createFileRoute("/_user/two-factor")({
	component: TwoFactorPage,
	validateSearch: twoFactorSearchValidator,
});
