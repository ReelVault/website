import { createFileRoute } from "@tanstack/react-router";
import { adminMediaFilesQueryOptions } from "@/client/hooks/use-admin-media";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminMediaPage = lazyRouteComponent(() => import("@/pages/admin/media/media-page"));

// zod-free validateSearch — see src/routes/player/$id.tsx.
interface AdminMediaSearch {
	q?: string;
	sort?: string;
	page?: number;
	/** Passed by library cards; the page does not consume it yet. */
	libraryId?: string;
}

function adminMediaSearchValidator(search: Record<string, unknown>): AdminMediaSearch {
	return {
		q: typeof search.q === "string" ? search.q : undefined,
		sort: typeof search.sort === "string" ? search.sort : undefined,
		page: Number.isFinite(Number(search.page)) && Number(search.page) > 0 ? Number(search.page) : undefined,
		libraryId: typeof search.libraryId === "string" ? search.libraryId : undefined,
	};
}

export const Route = createFileRoute("/admin/media/")({
	validateSearch: adminMediaSearchValidator,
	loader: ({ context: { queryClient } }) => {
		detach(queryClient.query(adminMediaFilesQueryOptions()));
	},
	component: AdminMediaPage,
});
