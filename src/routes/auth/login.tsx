import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";
import { redirectSearchValidator } from "@/types/search-params";

const LoginPage = lazyRouteComponent(() => import("@/pages/auth/login/login-page"));

export const Route = createFileRoute("/auth/login")({
	component: LoginPage,
	validateSearch: redirectSearchValidator,
});
