import { createFileRoute } from "@tanstack/react-router";
import { companyDetailsQueryOptions } from "@/client/hooks/use-companies";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const CompanyDetailPage = lazyRouteComponent(() => import("@/pages/web/companies/companies-by-id-page"));

// zod-free validateSearch — see src/routes/admin/media/index.tsx.
function pageSearchValidator(search: Record<string, unknown>): { page?: number } {
	const rawPage = Number(search.page);

	return { page: Number.isInteger(rawPage) && rawPage > 1 ? rawPage : undefined };
}

export const Route = createFileRoute("/_web/companies/$id")({
	validateSearch: pageSearchValidator,
	loader: ({ context: { queryClient }, params }) => {
		detach(
			queryClient.query({
				...companyDetailsQueryOptions(params.id),
				staleTime: "static",
			}),
		);
	},
	component: CompanyDetailPage,
});
