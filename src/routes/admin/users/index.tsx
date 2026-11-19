import { createFileRoute } from "@tanstack/react-router";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";
import { parsePageParam } from "@/routes/-search-params";

const AdminUsersPage = lazyRouteComponent(() => import("@/pages/admin/users/users-page"));

// zod-free validateSearch — see src/routes/admin/media/index.tsx.
interface AdminUsersSearch {
	q?: string;
	page?: number;
	role?: "admin" | "user";
	status?: "active" | "blocked";
}

function adminUsersSearchValidator(search: Record<string, unknown>): AdminUsersSearch {
	return {
		q: typeof search.q === "string" ? search.q : undefined,
		page: parsePageParam(search.page),
		role: search.role === "admin" || search.role === "user" ? search.role : undefined,
		status: search.status === "active" || search.status === "blocked" ? search.status : undefined,
	};
}

export const Route = createFileRoute("/admin/users/")({
	validateSearch: adminUsersSearchValidator,
	loader: ({ context: { queryClient } }) => {
		detach(async () => {
			const { adminUsersQueryOptions } = await import("@/client/hooks/use-admin-users");

			await queryClient.query(adminUsersQueryOptions({ search: "" }));
		});
	},
	component: AdminUsersPage,
});
