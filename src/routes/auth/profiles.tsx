import { createFileRoute } from "@tanstack/react-router";
import { profilesQueryOptions } from "@/client/hooks/use-profiles";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";
import { redirectSearchValidator } from "@/types/search-params";

const ProfilesPage = lazyRouteComponent(() => import("@/pages/auth/profiles/profiles-page"));

export const Route = createFileRoute("/auth/profiles")({
	loader: ({ context: { queryClient } }) => {
		detach(queryClient.query(profilesQueryOptions()));
	},
	component: ProfilesPage,
	validateSearch: redirectSearchValidator,
});
