import { createFileRoute } from "@tanstack/react-router";
import {
	adminMetadataQueryOptions,
	parseMetadataMinMatchScore,
	parseMetadataStartsWith,
	parseMetadataYear,
} from "@/client/hooks/use-admin-metadata";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminMetadataPage = lazyRouteComponent(() => import("@/pages/admin/metadata/metadata-page"));

interface AdminMetadataSearch {
	q?: string;
	page?: number;
	filter?: string;
	type?: string;
	sort?: string;
	yearFrom?: number;
	yearTo?: number;
	minMatchScore?: number;
	startsWith?: string;
}

function adminMetadataSearchValidator(search: Record<string, unknown>): AdminMetadataSearch {
	return {
		q: typeof search.q === "string" ? search.q : undefined,
		page: Number.isFinite(Number(search.page)) && Number(search.page) > 0 ? Number(search.page) : undefined,
		filter: typeof search.filter === "string" ? search.filter : undefined,
		type: typeof search.type === "string" ? search.type : undefined,
		sort: typeof search.sort === "string" ? search.sort : undefined,
		yearFrom: parseMetadataYear(search.yearFrom),
		yearTo: parseMetadataYear(search.yearTo),
		minMatchScore: parseMetadataMinMatchScore(search.minMatchScore),
		startsWith: parseMetadataStartsWith(search.startsWith),
	};
}

export const Route = createFileRoute("/admin/metadata/")({
	validateSearch: adminMetadataSearchValidator,
	loader: ({ context: { queryClient } }) => {
		detach(queryClient.query(adminMetadataQueryOptions({ page: 1, pageSize: 20, search: "" })));
	},
	component: AdminMetadataPage,
});
