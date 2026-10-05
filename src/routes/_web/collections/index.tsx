import { createFileRoute } from "@tanstack/react-router";
import { collectionsPageQueryOptions } from "@/client/hooks/use-collections";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const CollectionsPage = lazyRouteComponent(() => import("@/pages/web/collections/collections-page"));

// zod-free validateSearch — see src/routes/admin/media/index.tsx.
function pageSearchValidator(search: Record<string, unknown>): { page?: number } {
	const rawPage = Number(search.page);

	return { page: Number.isInteger(rawPage) && rawPage > 1 ? rawPage : undefined };
}

export const Route = createFileRoute("/_web/collections/")({
	validateSearch: pageSearchValidator,
	loader: ({ context: { queryClient } }) => {
		detach(queryClient.query(collectionsPageQueryOptions(1)));
	},
	component: CollectionsPage,
});
