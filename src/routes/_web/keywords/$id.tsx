import { createFileRoute } from "@tanstack/react-router";
import { taxonomyDetailsQueryOptions } from "@/client/hooks/use-taxonomy-details";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const KeywordDetailPage = lazyRouteComponent(() => import("@/pages/web/keywords/keyword-by-id-page"));

// zod-free validateSearch — see src/routes/admin/media/index.tsx.
function pageSearchValidator(search: Record<string, unknown>): { page?: number } {
	const rawPage = Number(search.page);

	return { page: Number.isInteger(rawPage) && rawPage > 1 ? rawPage : undefined };
}

export const Route = createFileRoute("/_web/keywords/$id")({
	validateSearch: pageSearchValidator,
	loader: ({ context: { queryClient }, params }) => {
		detach(
			queryClient.query({
				...taxonomyDetailsQueryOptions("keyword", params.id),
				staleTime: "static",
			}),
		);
	},
	component: KeywordDetailPage,
});
