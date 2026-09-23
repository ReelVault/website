import { createFileRoute } from "@tanstack/react-router";
import { adminUsersQueryOptions } from "@/client/hooks/use-admin-users";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminUsersPage = lazyRouteComponent(() => import("@/pages/admin/users/users-page"));

export const Route = createFileRoute("/admin/users/")({
	loader: ({ context: { queryClient } }) => {
		detach(queryClient.query(adminUsersQueryOptions("")));
	},
	component: AdminUsersPage,
});
