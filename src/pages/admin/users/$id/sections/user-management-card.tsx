import { Key, Trash2, UserCog } from "lucide-react";
import { AsyncButton } from "@/components/async-button";
import { ConfirmAction } from "@/components/confirm-action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { m } from "@/paraglide/messages";

interface UserManagementCardProps {
	user?: {
		id: string;
		name: string;
		role: "admin" | "user";
		banned: boolean;
	} | null;
	isLoading: boolean;
	isUpdating: boolean;
	isDeleting: boolean;
	onToggleRole: () => void;
	onToggleBan: () => void;
	onOpenPassword: () => void;
	onRemoveUser: () => void;
}

export function UserManagementCard({
	user,
	isLoading,
	isUpdating,
	isDeleting,
	onToggleRole,
	onToggleBan,
	onOpenPassword,
	onRemoveUser,
}: UserManagementCardProps) {
	if (isLoading) return <Skeleton className="h-32 rounded-lg" />;

	if (!user) return null;

	return (
		<Card className="shadow-none">
			<CardHeader className="flex flex-col gap-3 border-border border-b sm:flex-row sm:items-start sm:justify-between">
				<div className="flex flex-col gap-1">
					<CardTitle className="text-base">{m.admin_users_account_management()}</CardTitle>
					<CardDescription>{m.admin_users_role_access_description()}</CardDescription>
				</div>
			</CardHeader>
			<CardContent className="flex flex-wrap items-center gap-3 p-4 sm:p-6">
				<AsyncButton size="sm" variant="outline" isPending={isUpdating} pendingLabel={m.common_saving_dots()} onClick={onToggleRole}>
					<UserCog className="size-4" aria-hidden="true" />{" "}
					{user.role === "admin" ? m.admin_users_revoke_admin() : m.admin_users_grant_admin()}
				</AsyncButton>
				<AsyncButton
					size="sm"
					variant={user.banned ? "outline" : "destructive"}
					isPending={isUpdating}
					pendingLabel={m.common_saving_dots()}
					onClick={onToggleBan}
				>
					{user.banned ? m.admin_users_unblock_account() : m.admin_users_block_account()}
				</AsyncButton>
				<Button size="sm" variant="outline" className="gap-2" onClick={onOpenPassword}>
					<Key className="size-4" aria-hidden="true" /> {m.admin_users_change_password()}
				</Button>
				<ConfirmAction
					trigger={
						<Button size="sm" variant="destructive" className="gap-2" disabled={isDeleting}>
							<Trash2 className="size-4" aria-hidden="true" /> {m.admin_users_delete_account()}
						</Button>
					}
					title={m.admin_users_delete_account_confirm({ name: user.name })}
					description={m.admin_users_delete_account_warning()}
					confirmLabel={m.admin_users_delete_account()}
					onConfirm={onRemoveUser}
				/>
			</CardContent>
		</Card>
	);
}
