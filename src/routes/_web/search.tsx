import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";
import { searchPageSearchValidator } from "@/types/search-params";

const SearchPage = lazyRouteComponent(() => import("@/pages/web/search/search-page"));

export const Route = createFileRoute("/_web/search")({
	validateSearch: searchPageSearchValidator,
	component: SearchPage,
});
