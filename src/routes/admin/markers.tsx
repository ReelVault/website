import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminMarkersPage = lazyRouteComponent(() => import("@/pages/admin/markers/markers-page"));

interface AdminMarkersSearch {
	q?: string;
	type?: string;
	source?: string;
}

function adminMarkersSearchValidator(search: Record<string, unknown>): AdminMarkersSearch {
	return {
		q: typeof search.q === "string" ? search.q : undefined,
		type: typeof search.type === "string" ? search.type : undefined,
		source: typeof search.source === "string" ? search.source : undefined,
	};
}

export const Route = createFileRoute("/admin/markers")({
	validateSearch: adminMarkersSearchValidator,
	component: AdminMarkersPage,
});
