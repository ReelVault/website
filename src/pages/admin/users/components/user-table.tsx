import { Copy, Shield, ShieldCheck, Trash2, UserCheck, UserRoundX } from "lucide-react";
import { ResponsiveDataList } from "@/components/responsive-data-list";
import { Card, CardContent } from "@/components/ui/card";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuGroup,
	ContextMenuItem,
	ContextMenuLabel,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { formatDate, formatTimeAgo } from "@/utils/format-utils";
import { type AdminUser, UserActions, UserStatus, UserSummary } from "./user-item-parts";

interface UserTableProps {
	users: AdminUser[];
	updatingId?: string;
	onToggleBan: (user: AdminUser) => Promise<void>;
	onToggleRole: (user: AdminUser) => Promise<void>;
	onDelete: (id: string, name: string) => Promise<void>;
	onCopy: (text: string, label: string) => Promise<void>;
	selectedIds: ReadonlySet<string>;
	onToggleSelect: (id: string) => void;
	onToggleSelectAll: (ids: string[]) => void;
}

type UserRowHandlers = Pick<UserTableProps, "onToggleBan" | "onToggleRole" | "onDelete" | "onCopy">;

/** Right-click (or long-press) menu shared by the table row and the phone card. */
function UserContextMenuContent({ user, onToggleBan, onToggleRole, onDelete, onCopy }: UserRowHandlers & { user: AdminUser }) {
	return (
		<ContextMenuContent className="w-64">
			<ContextMenuGroup>
				<ContextMenuLabel className="truncate">{user.name}</ContextMenuLabel>
			</ContextMenuGroup>
			<ContextMenuSeparator />
			<ContextMenuGroup>
				<ContextMenuItem onClick={() => detach(() => onToggleRole(user))} className="cursor-pointer">
					<Shield className="text-primary size-4" />
					<span>{user.role === "admin" ? m.admin_users_revoke_admin() : m.admin_users_grant_admin()}</span>
				</ContextMenuItem>
				<ContextMenuItem onClick={() => detach(() => onToggleBan(user))} className="cursor-pointer">
					{user.banned ? <UserCheck className="text-success size-4" /> : <UserRoundX className="text-warning size-4" />}
					<span>{user.banned ? m.admin_users_unblock_account() : m.admin_users_block_account()}</span>
				</ContextMenuItem>
				<ContextMenuItem onClick={() => detach(() => onCopy(user.email, m.common_email()))} className="cursor-pointer">
					<Copy className="text-muted-foreground size-4" />
					<span>{m.common_copy_email()}</span>
				</ContextMenuItem>
				<ContextMenuItem onClick={() => detach(() => onCopy(user.id, m.admin_users_user_id()))} className="cursor-pointer">
					<Copy className="text-muted-foreground size-4" />
					<span>{m.admin_users_copy_account_id()}</span>
				</ContextMenuItem>
			</ContextMenuGroup>
			<ContextMenuSeparator />
			<ContextMenuGroup>
				<ContextMenuItem onClick={() => detach(() => onDelete(user.id, user.name))} variant="destructive" className="cursor-pointer">
					<Trash2 className="size-4" />
					<span>{m.admin_users_delete_account()}</span>
				</ContextMenuItem>
			</ContextMenuGroup>
		</ContextMenuContent>
	);
}

export function UserTable({
	users,
	updatingId,
	onToggleBan,
	onToggleRole,
	onDelete,
	onCopy,
	selectedIds,
	onToggleSelect,
	onToggleSelectAll,
}: UserTableProps) {
	const handlers: UserRowHandlers = { onToggleBan, onToggleRole, onDelete, onCopy };

	return (
		<ResponsiveDataList
			items={users}
			getKey={(user) => user.id}
			renderTable={(items) => (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-8">
								<input
									type="checkbox"
									className="accent-primary size-4"
									aria-label={m.admin_users_select_all()}
									checked={items.length > 0 && items.every((user) => selectedIds.has(user.id))}
									onChange={() => onToggleSelectAll(items.map((user) => user.id))}
								/>
							</TableHead>
							<TableHead>{m.admin_users_user_word()}</TableHead>
							<TableHead>{m.admin_users_role_security()}</TableHead>
							<TableHead>{m.common_status()}</TableHead>
							<TableHead>{m.common_created()}</TableHead>
							<TableHead>{m.admin_users_last_active()}</TableHead>
							<TableHead>{m.admin_users_sessions()}</TableHead>
							<TableHead className="text-right">{m.common_actions()}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{items.map((user) => (
							<ContextMenu key={user.id}>
								<ContextMenuTrigger render={<TableRow />}>
									<TableCell>
										<input
											type="checkbox"
											className="accent-primary size-4"
											aria-label={m.admin_users_select_user()}
											checked={selectedIds.has(user.id)}
											onChange={() => onToggleSelect(user.id)}
										/>
									</TableCell>
									<TableCell>
										<UserSummary user={user} />
									</TableCell>
									<TableCell>
										<div className="flex flex-col gap-0.5">
											<div className="flex items-center gap-1.5 text-xs">
												<Shield className="text-primary size-3.5" aria-hidden="true" />
												<span>{user.role === "admin" ? m.admin_users_role_admin() : m.admin_users_role_user()}</span>
											</div>
											{user.twoFactorEnabled && (
												<span className="text-success flex items-center gap-1 text-xs font-medium">
													<ShieldCheck className="size-3" />
													{m.admin_users_2fa_active()}
												</span>
											)}
										</div>
									</TableCell>
									<TableCell>
										<UserStatus user={user} />
									</TableCell>
									<TableCell tone="muted" size="sm" className="whitespace-nowrap">
										{formatDate(user.createdAt)}
									</TableCell>
									<TableCell tone="muted" size="sm" className="whitespace-nowrap">
										{user.lastActiveAt ? formatTimeAgo(user.lastActiveAt) : m.admin_users_never_active()}
									</TableCell>
									<TableCell size="sm">{user.activeSessionCount}</TableCell>
									<TableCell className="text-right">
										<UserActions
											user={user}
											isUpdating={updatingId === user.id}
											onToggleBan={onToggleBan}
											onToggleRole={onToggleRole}
											onDelete={onDelete}
										/>
									</TableCell>
								</ContextMenuTrigger>
								<UserContextMenuContent user={user} {...handlers} />
							</ContextMenu>
						))}
					</TableBody>
				</Table>
			)}
			renderCard={(user) => (
				<ContextMenu>
					<ContextMenuTrigger render={<Card />}>
						<CardContent className="flex flex-col gap-4">
							<label className="flex items-center gap-2 text-xs">
								<input
									type="checkbox"
									className="accent-primary size-4"
									checked={selectedIds.has(user.id)}
									onChange={() => onToggleSelect(user.id)}
								/>
								{m.admin_users_select_user()}
							</label>
							<div className="flex items-start justify-between gap-3">
								<UserSummary user={user} />
								<UserStatus user={user} />
							</div>
							<div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
								<span className="flex items-center gap-1">
									<Shield className="text-primary size-3.5" />
									{user.role === "admin" ? m.admin_users_role_admin() : m.admin_users_role_user()}
								</span>
								{user.twoFactorEnabled && (
									<span className="text-success flex items-center gap-1 font-medium">
										<ShieldCheck className="size-3" /> {m.common_2fa_short()}
									</span>
								)}
								<span>{m.common_created_with_date({ date: formatDate(user.createdAt) })}</span>
								<span>
									{m.admin_users_last_active_line({
										time: user.lastActiveAt ? formatTimeAgo(user.lastActiveAt) : m.admin_users_never_active(),
									})}
								</span>
							</div>
							<UserActions
								user={user}
								isUpdating={updatingId === user.id}
								onToggleBan={onToggleBan}
								onToggleRole={onToggleRole}
								onDelete={onDelete}
							/>
						</CardContent>
					</ContextMenuTrigger>
					<UserContextMenuContent user={user} {...handlers} />
				</ContextMenu>
			)}
		/>
	);
}
