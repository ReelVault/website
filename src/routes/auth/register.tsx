import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const RegisterPage = lazyRouteComponent(() => import("@/pages/auth/register/register-page"));

export const Route = createFileRoute("/auth/register")({
	component: RegisterPage,
});
