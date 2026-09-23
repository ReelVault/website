import { createFileRoute } from "@tanstack/react-router";
import { companiesListQueryOptions } from "@/client/hooks/use-companies";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const CompaniesPage = lazyRouteComponent(() => import("@/pages/web/companies/companies-page"));

export const Route = createFileRoute("/_web/companies/")({
	loader: ({ context: { queryClient } }) => {
		detach(
			queryClient.query({
				...companiesListQueryOptions(),
				staleTime: "static",
			}),
		);
	},
	component: CompaniesPage,
});
