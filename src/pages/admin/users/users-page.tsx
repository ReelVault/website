import { useNavigate, useSearch } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { type ReactNode, useState } from "react";
import { useRevokeUsersSessions } from "@/client/hooks/use-admin-user-sessions";
import { useAdminUsers } from "@/client/hooks/use-admin-users";
import { AppEmptyState, AppErrorState } from "@/components/app-states";
import { ConfirmAction } from "@/components/confirm-action";
import { SimplePagination } from "@/components/simple-pagination";
import { Button } from "@/components/ui/button";
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
import { DeleteUserDialog } from "./components/delete-user-dialog";
import { UserFilterBar } from "./components/user-filter-bar";
import type { AdminUser } from "./components/user-item-parts";
import { UserTable } from "./components/user-table";
import { blockAccount, toggleAccountRole, unblockAccount } from "./user-account-actions";

export default function AdminUsersPage() {
	const { q, role, status, page: urlPage = 1 } = useSearch({ from: "/admin/users/" });
	const navigate = useNavigate({ from: "/admin/users/" });
	const [createOpen, setCreateOpen] = useState(false);
	const [banTarget, setBanTarget] = useState<AdminUser | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const revokeSessions = useRevokeUsersSessions();
	// The search input is the URL value itself — typing rewrites ?q= (replace),
	// the query fires on the debounced copy, so Back/refresh restore everything.
	const search = q ?? "";
	const setSearch = (value: string) => {
		detach(navigate({ search: (prev) => ({ ...prev, q: value || undefined, page: undefined }), replace: true }));
	};
	const setRole = (value: "admin" | "user" | undefined) => {
		detach(navigate({ search: (prev) => ({ ...prev, role: value, page: undefined }), replace: true }));
	};
	const setStatus = (value: "active" | "blocked" | undefined) => {
		detach(navigate({ search: (prev) => ({ ...prev, status: value, page: undefined }), replace: true }));
	};
	const debouncedSearch = useDebounce({ value: search, delay: 500 });
	const page = urlPage;
	const { users, total, totalPages, isLoading, error, refetch, updateUser, deleteUser, createUser, isCreating, updatingId } = useAdminUsers(
		{ search: debouncedSearch, role, status },
		page,
	);

	const toggleSelect = (id: string) => {
		setSelectedIds((current) => {
			const next = new Set(current);
			if (next.has(id)) next.delete(id);
			else next.add(id);

			return next;
		});
	};

	const toggleSelectAll = (ids: string[]) => {
		setSelectedIds((current) => {
			const allSelected = ids.every((id) => current.has(id));
			const next = new Set(current);
			for (const id of ids) {
				if (allSelected) next.delete(id);
				else next.add(id);
			}

			return next;
		});
	};

	const signOutSelected = async () => {
		await revokeSessions.mutateAsync([...selectedIds]);
		setSelectedIds(new Set());
	};

	const setPage = (next: number) => {
		detach(navigate({ search: (prev) => ({ ...prev, page: next > 1 ? next : undefined }), replace: true }));
	};

	const handleCreate = async (body: Parameters<typeof createUser>[0]): Promise<boolean> => {
		if (isCreating) return false;

		try {
			const created = await createUser(body);
			toast.success(m.admin_users_account_created_named({ name: created.name }));

			return true;
		} catch (err) {
			toastError(m.admin_users_failed_to_create(), err);

			return false;
		}
	};

	const accountOf = (user: AdminUser) => ({ user, update: (body: Parameters<typeof updateUser>[1]) => updateUser(user.id, body) });

	const toggleBan = async (user: AdminUser) => {
		if (updatingId === user.id) return;

		if (user.banned) {
			await unblockAccount(accountOf(user));

			return;
		}

		setBanTarget(user);
	};

	const confirmBan = async (reason: string | null) => {
		const user = banTarget;
		if (!user || updatingId === user.id) return;

		if (await blockAccount(accountOf(user), reason)) setBanTarget(null);
	};

	const toggleRole = async (user: AdminUser) => {
		if (updatingId === user.id) return;

		await toggleAccountRole(accountOf(user));
	};

	const confirmDelete = async () => {
		const target = deleteTarget;
		if (!target || updatingId === target.id) return;

		// The delete hook reports success and failure itself; a failure keeps the dialog open.
		await deleteUser(target.id).then(
			() => {
				setDeleteTarget(null);
				setSelectedIds((prev) => {
					const next = new Set(prev);
					next.delete(target.id);

					return next;
				});
			},
			() => null,
		);
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
				onDelete={(id, name) => Promise.resolve(setDeleteTarget({ id, name }))}
				onCopy={copyToClipboard}
				selectedIds={selectedIds}
				onToggleSelect={toggleSelect}
				onToggleSelectAll={toggleSelectAll}
			/>
		);
	}

	return (
		<div className="flex flex-col gap-6">
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
						role={role}
						onRoleChange={setRole}
						status={status}
						onStatusChange={setStatus}
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
				{selectedIds.size > 0 && (
					<div className="border-border bg-card flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 text-sm">
						<span>{m.admin_users_selected({ count: selectedIds.size })}</span>
						<ConfirmAction
							trigger={
								<Button variant="destructive" size="sm" disabled={revokeSessions.isPending}>
									{m.admin_users_sign_out_selected()}
								</Button>
							}
							title={m.admin_users_sign_out_selected_title()}
							description={m.admin_users_sign_out_selected_description()}
							confirmLabel={m.admin_users_sign_out_selected()}
							onConfirm={() => detach(signOutSelected())}
						/>
					</div>
				)}
				{listContent}
				<SimplePagination variant="admin" currentPage={page} totalPages={totalPages} isLoading={isLoading} onPageChange={setPage} />
			</AdminSection>

			<CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={handleCreate} isCreating={isCreating} />
			<DeleteUserDialog
				userName={deleteTarget?.name ?? null}
				isPending={updatingId === deleteTarget?.id}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
				onConfirm={() => detach(confirmDelete)}
			/>
			<BanUserDialog
				userName={banTarget?.name ?? null}
				isPending={updatingId === banTarget?.id}
				onOpenChange={(open) => {
					if (!open) setBanTarget(null);
				}}
				onConfirm={(reason) => detach(() => confirmBan(reason))}
			/>
		</div>
	);
}
