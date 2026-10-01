import { createFileRoute } from "@tanstack/react-router";
import { adminUsersQueryOptions } from "@/client/hooks/use-admin-users";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminUsersPage = lazyRouteComponent(() => import("@/pages/admin/users/users-page"));

// zod-free validateSearch — see src/routes/admin/media/index.tsx.
interface AdminUsersSearch {
	q?: string;
	page?: number;
}

function adminUsersSearchValidator(search: Record<string, unknown>): AdminUsersSearch {
	return {
		q: typeof search.q === "string" ? search.q : undefined,
		page: Number.isFinite(Number(search.page)) && Number(search.page) > 0 ? Number(search.page) : undefined,
	};
}

export const Route = createFileRoute("/admin/users/")({
	validateSearch: adminUsersSearchValidator,
	loader: ({ context: { queryClient } }) => {
		detach(queryClient.query(adminUsersQueryOptions("")));
	},
	component: AdminUsersPage,
});
