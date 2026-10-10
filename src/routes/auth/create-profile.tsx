import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";
import { redirectSearchValidator } from "@/types/search-params";

const CreateProfilePage = lazyRouteComponent(() => import("@/pages/auth/create-profile/create-profile-page"));

export const Route = createFileRoute("/auth/create-profile")({
	component: CreateProfilePage,
	validateSearch: redirectSearchValidator,
});
