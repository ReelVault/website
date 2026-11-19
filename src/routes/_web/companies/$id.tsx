import { createFileRoute } from "@tanstack/react-router";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";
import { validatePageSearch } from "@/routes/-search-params";

const CompanyDetailPage = lazyRouteComponent(() => import("@/pages/web/companies/companies-by-id-page"));

export const Route = createFileRoute("/_web/companies/$id")({
	validateSearch: validatePageSearch,
	loader: ({ context: { queryClient }, params }) => {
		detach(async () => {
			const { companyDetailsQueryOptions } = await import("@/client/hooks/use-companies");

			await queryClient.query({
				...companyDetailsQueryOptions(params.id),
				staleTime: "static",
			});
		});
	},
	component: CompanyDetailPage,
});
