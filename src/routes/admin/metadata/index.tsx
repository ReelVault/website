import { createFileRoute } from "@tanstack/react-router";
import { adminMetadataQueryOptions } from "@/client/hooks/use-admin-metadata";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminMetadataPage = lazyRouteComponent(() => import("@/pages/admin/metadata/metadata-page"));

interface AdminMetadataSearch {
	q?: string;
	page?: number;
	filter?: string;
}

function adminMetadataSearchValidator(search: Record<string, unknown>): AdminMetadataSearch {
	return {
		q: typeof search.q === "string" ? search.q : undefined,
		page: Number.isFinite(Number(search.page)) && Number(search.page) > 0 ? Number(search.page) : undefined,
		filter: typeof search.filter === "string" ? search.filter : undefined,
	};
}

export const Route = createFileRoute("/admin/metadata/")({
	validateSearch: adminMetadataSearchValidator,
	loader: ({ context: { queryClient } }) => {
		detach(queryClient.query(adminMetadataQueryOptions({ page: 1, pageSize: 20, search: "" })));
	},
	component: AdminMetadataPage,
});
