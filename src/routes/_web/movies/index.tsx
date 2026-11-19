import { createFileRoute, redirect } from "@tanstack/react-router";
import { librariesQueryOptions } from "@/client/library-queries";
import { lazyRouteComponent } from "@/lib/lazy-route-component";
import { validateLibrarySearch } from "@/routes/-library-search";

const MoviesPage = lazyRouteComponent(() => import("@/pages/web/_libraries/movies/movies-page"));

export const Route = createFileRoute("/_web/movies/")({
	validateSearch: validateLibrarySearch,
	beforeLoad: async ({ context: { queryClient } }) => {
		const res = await queryClient.query({ ...librariesQueryOptions("movies"), staleTime: "static" });
		const first = res.data[0];
		if (first?.id) {
			redirect({ to: "/movies/$id", params: { id: first.id }, throw: true });
		}
	},
	component: MoviesPage,
});
