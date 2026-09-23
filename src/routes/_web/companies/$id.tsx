import { createFileRoute } from "@tanstack/react-router";
import { companyDetailsQueryOptions } from "@/client/hooks/use-companies";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const CompanyDetailPage = lazyRouteComponent(() => import("@/pages/web/companies/companies-by-id-page"));

export const Route = createFileRoute("/_web/companies/$id")({
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
