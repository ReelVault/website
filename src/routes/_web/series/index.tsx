import { createFileRoute, redirect } from "@tanstack/react-router";
import { librariesQueryOptions } from "@/client/library-queries";
import { lazyRouteComponent } from "@/lib/lazy-route-component";
import { validateLibrarySearch } from "@/routes/-library-search";

const SeriesPage = lazyRouteComponent(() => import("@/pages/web/_libraries/series/series-page"));

export const Route = createFileRoute("/_web/series/")({
	validateSearch: validateLibrarySearch,
	beforeLoad: async ({ context: { queryClient } }) => {
		const res = await queryClient.query({ ...librariesQueryOptions("tv_shows"), staleTime: "static" });
		const first = res.data[0];
		if (first?.id) {
			redirect({ to: "/series/$id", params: { id: first.id }, throw: true });
		}
	},
	component: SeriesPage,
});
