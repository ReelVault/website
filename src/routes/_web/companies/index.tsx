import { createFileRoute } from "@tanstack/react-router";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const CompaniesPage = lazyRouteComponent(() => import("@/pages/web/companies/companies-page"));

export const Route = createFileRoute("/_web/companies/")({
	loader: ({ context: { queryClient } }) => {
		detach(async () => {
			const { companiesListQueryOptions } = await import("@/client/hooks/use-companies");

			await queryClient.query({
				...companiesListQueryOptions(),
				staleTime: "static",
			});
		});
	},
	component: CompaniesPage,
});
