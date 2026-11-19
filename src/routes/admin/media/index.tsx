import { createFileRoute } from "@tanstack/react-router";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";
import { parsePageParam } from "@/routes/-search-params";

const AdminMediaPage = lazyRouteComponent(() => import("@/pages/admin/media/media-page"));

// zod-free validateSearch — see src/routes/player/$id.tsx.
interface AdminMediaSearch {
	q?: string;
	sort?: string;
	page?: number;
	/** Passed by library cards to scope the list to one library. */
	libraryId?: string;
}

function adminMediaSearchValidator(search: Record<string, unknown>): AdminMediaSearch {
	return {
		q: typeof search.q === "string" ? search.q : undefined,
		sort: typeof search.sort === "string" ? search.sort : undefined,
		page: parsePageParam(search.page),
		libraryId: typeof search.libraryId === "string" ? search.libraryId : undefined,
	};
}

export const Route = createFileRoute("/admin/media/")({
	validateSearch: adminMediaSearchValidator,
	loader: ({ context: { queryClient } }) => {
		detach(async () => {
			const { adminMediaFilesQueryOptions } = await import("@/client/hooks/use-admin-media");

			await queryClient.query(adminMediaFilesQueryOptions());
		});
	},
	component: AdminMediaPage,
});
