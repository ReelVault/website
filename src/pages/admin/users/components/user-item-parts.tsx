import { Link } from "@tanstack/react-router";
import { Trash2, UserRoundX } from "lucide-react";
import type { useAdminUsers } from "@/client/hooks/use-admin-users";
import { AsyncButton } from "@/components/async-button";
import { ConfirmAction } from "@/components/confirm-action";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";

export type AdminUser = ReturnType<typeof useAdminUsers>["users"][number];

export function UserSummary({ user }: { user: AdminUser }) {
	return (
		<div className="min-w-0">
			<div className="flex items-center gap-2">
				<Link
					to="/admin/users/$id"
					params={{ id: user.id }}
					className="truncate font-medium text-foreground hover:text-primary hover:underline"
				>
					{user.name}
				</Link>
				<span className="font-mono text-[10px] text-muted-foreground">{m.admin_users_id_short({ id: user.id.slice(0, 8) })}</span>
			</div>
			<p className="truncate text-muted-foreground text-xs">{user.email}</p>
		</div>
	);
}

export function UserStatus({ user }: { user: AdminUser }) {
	return (
		<div className="flex min-w-0 flex-col items-start gap-1">
			<StatusBadge status={user.banned ? "error" : "success"} label={user.banned ? m.admin_users_blocked_status() : m.common_active()} />
			{user.banned && user.banReason && <p className="max-w-48 truncate text-muted-foreground text-xs">{user.banReason}</p>}
		</div>
	);
}

export function UserActions({
	user,
	isUpdating,
	onToggleBan,
	onToggleRole,
	onDelete,
}: {
	user: AdminUser;
	isUpdating: boolean;
	onToggleBan: (user: AdminUser) => Promise<void>;
	onToggleRole: (user: AdminUser) => Promise<void>;
	onDelete: (id: string, name: string) => Promise<void>;
}) {
	return (
		<div className="flex flex-wrap items-center justify-end gap-2">
			<Button size="sm" variant="ghost" nativeButton={false} render={<Link to="/admin/users/$id" params={{ id: user.id }} />}>
				{m.user_profile_page_title()}
			</Button>
			<AsyncButton
				size="sm"
				variant="outline"
				isPending={isUpdating}
				pendingLabel={m.common_saving_dots()}
				onClick={() => detach(() => onToggleRole(user))}
			>
				{user.role === "admin" ? m.admin_users_revoke_admin() : m.admin_users_grant_admin()}
			</AsyncButton>
			<AsyncButton
				size="sm"
				variant={user.banned ? "outline" : "destructive"}
				isPending={isUpdating}
				pendingLabel={m.common_saving_dots()}
				onClick={() => detach(() => onToggleBan(user))}
			>
				<UserRoundX aria-hidden="true" /> {user.banned ? m.admin_users_unblock_action() : m.admin_users_block_action()}
			</AsyncButton>
			<ConfirmAction
				trigger={
					<Button
						size="icon-lg"
						variant="ghost"
						className="size-11 text-destructive hover:bg-destructive/10 hover:text-destructive"
						disabled={isUpdating}
						aria-label={m.admin_users_delete_account_named({ name: user.name })}
					>
						<Trash2 />
					</Button>
				}
				title={m.admin_users_delete_account_confirm({ name: user.name })}
				description={m.admin_users_delete_account_warning()}
				confirmLabel={m.admin_users_delete_account()}
				onConfirm={() => onDelete(user.id, user.name)}
			/>
		</div>
	);
}
