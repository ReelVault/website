import { Users } from "lucide-react";
import { type ReactNode, useState } from "react";
import { useAdminUsers } from "@/client/hooks/use-admin-users";
import { AppEmptyState, AppErrorState } from "@/components/app-states";
import { SimplePagination } from "@/components/simple-pagination";
import { SkeletonList } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { detach } from "@/lib/detach";
import { AdminPageHeader, AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { copyToClipboard } from "@/utils/clipboard-utils";
import { toast } from "@/utils/toast-facade";
import { toastError } from "@/utils/toast-utils";
import { BanUserDialog } from "./components/ban-user-dialog";
import { CreateUserDialog } from "./components/create-user-dialog";
import { UserFilterBar } from "./components/user-filter-bar";
import type { AdminUser } from "./components/user-item-parts";
import { UserTable } from "./components/user-table";

export default function AdminUsersPage() {
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [createOpen, setCreateOpen] = useState(false);
	const [banTarget, setBanTarget] = useState<AdminUser | null>(null);
	const debouncedSearch = useDebounce({ value: search, delay: 500 });
	const { users, total, totalPages, isLoading, error, refetch, updateUser, deleteUser, createUser, isCreating, updatingId } = useAdminUsers(
		debouncedSearch,
		page,
	);

	const handleCreate = async (body: Parameters<typeof createUser>[0]) => {
		if (isCreating) return;

		try {
			const created = await createUser(body);
			toast.success(m.admin_users_account_created_named({ name: created.name }));
			setCreateOpen(false);
		} catch (err) {
			toastError(m.admin_users_failed_to_create(), err);
		}
	};

	const unbanUser = async (user: AdminUser) => {
		try {
			await updateUser(user.id, { banned: false, banReason: null });
			toast.success(m.admin_users_account_unblocked_named({ name: user.name }));
		} catch (err) {
			toastError(m.admin_users_failed_to_unblock(), err);
		}
	};

	const toggleBan = async (user: AdminUser) => {
		if (updatingId === user.id) return;

		if (user.banned) {
			await unbanUser(user);

			return;
		}

		setBanTarget(user);
	};

	const confirmBan = async (reason: string | null) => {
		const user = banTarget;
		if (!user || updatingId === user.id) return;

		try {
			await updateUser(user.id, { banned: true, banReason: reason });
			toast.success(m.admin_users_account_blocked_named({ name: user.name }), {
				duration: 8000,
				action: {
					label: m.common_undo(),
					onClick: () => {
						detach(async () => {
							try {
								await updateUser(user.id, { banned: false, banReason: null });
								toast.success(m.admin_users_block_lifted({ name: user.name }));
							} catch (err) {
								toastError(m.admin_users_failed_to_lift_block(), err);
							}
						});
					},
				},
			});
			setBanTarget(null);
		} catch (err) {
			toastError(m.admin_users_failed_to_block(), err);
		}
	};

	const toggleRole = async (user: AdminUser) => {
		if (updatingId === user.id) return;

		try {
			await updateUser(user.id, { role: user.role === "admin" ? "user" : "admin" });
			toast.success(
				user.role === "admin"
					? m.admin_users_admin_revoked_named({ name: user.name })
					: m.admin_users_admin_granted_named({ name: user.name }),
			);
		} catch (err) {
			toastError(m.admin_users_failed_to_change_role(), err);
		}
	};

	const removeUser = async (id: string, name: string) => {
		if (updatingId === id) return;

		try {
			await deleteUser(id);
			toast.success(m.admin_users_account_deleted({ name }));
		} catch (err) {
			toastError(m.admin_users_account_delete_failed_named({ name }), err);
		}
	};

	let listContent: ReactNode;
	if (isLoading) {
		listContent = <SkeletonList count={6} className="gap-3" itemClassName="h-20 rounded-lg" />;
	} else if (users.length === 0) {
		listContent = <AppEmptyState title={m.admin_users_none_found()} description={m.admin_users_change_search_hint()} />;
	} else {
		listContent = (
			<UserTable
				users={users}
				updatingId={updatingId}
				onToggleBan={toggleBan}
				onToggleRole={toggleRole}
				onDelete={removeUser}
				onCopy={copyToClipboard}
			/>
		);
	}

	return (
		<main className="flex flex-col gap-6 text-foreground">
			<AdminPageHeader
				icon={Users}
				eyebrow={m.admin_users_accounts()}
				title={m.admin_nav_users()}
				count={total}
				description={m.admin_users_roles_description()}
				actions={
					<UserFilterBar
						search={search}
						onSearchChange={(value) => {
							setSearch(value);
							setPage(1);
						}}
						onOpenCreate={() => setCreateOpen(true)}
					/>
				}
			/>

			{error && (
				<AppErrorState
					title={m.admin_users_failed_to_fetch_users()}
					description={m.admin_users_check_permissions()}
					error={error}
					onRetry={() => detach(() => refetch())}
				/>
			)}
			<AdminSection title={m.admin_users_list()}>
				{listContent}
				<SimplePagination variant="admin" currentPage={page} totalPages={totalPages} isLoading={isLoading} onPageChange={setPage} />
			</AdminSection>

			<CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={handleCreate} isCreating={isCreating} />
			<BanUserDialog
				userName={banTarget?.name ?? null}
				isPending={updatingId === banTarget?.id}
				onOpenChange={(open) => {
					if (!open) setBanTarget(null);
				}}
				onConfirm={(reason) => detach(() => confirmBan(reason))}
			/>
		</main>
	);
}
