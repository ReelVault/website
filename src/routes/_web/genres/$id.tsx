import { createFileRoute } from "@tanstack/react-router";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const GenreDetailPage = lazyRouteComponent(() => import("@/pages/web/genres/genre-by-id-page"));

// zod-free validateSearch — see src/routes/admin/media/index.tsx.
function pageSearchValidator(search: Record<string, unknown>): { page?: number } {
	const rawPage = Number(search.page);

	return { page: Number.isInteger(rawPage) && rawPage > 1 ? rawPage : undefined };
}

export const Route = createFileRoute("/_web/genres/$id")({
	validateSearch: pageSearchValidator,
	loader: ({ context: { queryClient }, params }) => {
		detach(async () => {
			const { taxonomyDetailsQueryOptions } = await import("@/client/hooks/use-taxonomy-details");

			await queryClient.query({
				...taxonomyDetailsQueryOptions("genre", params.id),
				staleTime: "static",
			});
		});
	},
	component: GenreDetailPage,
});
