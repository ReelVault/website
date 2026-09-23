import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminPluginsPage = lazyRouteComponent(() => import("@/pages/admin/plugins/plugins-page"));

// zod-free validateSearch — see src/routes/player/$id.tsx.
interface AdminPluginsSearch {
	view?: string;
	category?: string;
}

function adminPluginsSearchValidator(search: Record<string, unknown>): AdminPluginsSearch {
	return {
		view: search.view === "installed" || search.view === "available" ? search.view : undefined,
		category: typeof search.category === "string" ? search.category : undefined,
	};
}

export const Route = createFileRoute("/admin/plugins/")({
	validateSearch: adminPluginsSearchValidator,
	component: AdminPluginsPage,
});
