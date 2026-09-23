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
import { formatDate } from "@/utils/format-utils";
import { type AdminUser, UserActions, UserStatus, UserSummary } from "./user-item-parts";

interface UserTableProps {
	users: AdminUser[];
	updatingId?: string;
	onToggleBan: (user: AdminUser) => Promise<void>;
	onToggleRole: (user: AdminUser) => Promise<void>;
	onDelete: (id: string, name: string) => Promise<void>;
	onCopy: (text: string, label: string) => Promise<void>;
}

export function UserTable({ users, updatingId, onToggleBan, onToggleRole, onDelete, onCopy }: UserTableProps) {
	return (
		<ResponsiveDataList
			items={users}
			getKey={(user) => user.id}
			renderTable={(items) => (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{m.admin_users_user_word()}</TableHead>
							<TableHead>{m.admin_users_role_security()}</TableHead>
							<TableHead>{m.common_status()}</TableHead>
							<TableHead>{m.common_created()}</TableHead>
							<TableHead className="text-right">{m.common_actions()}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{items.map((user) => (
							<ContextMenu key={user.id}>
								<ContextMenuTrigger render={<TableRow />}>
									<TableCell>
										<UserSummary user={user} />
									</TableCell>
									<TableCell>
										<div className="flex flex-col gap-0.5">
											<div className="flex items-center gap-1.5 text-xs">
												<Shield className="size-3.5 text-primary" aria-hidden="true" />
												<span>{user.role === "admin" ? m.admin_users_role_admin() : m.admin_users_role_user()}</span>
											</div>
											{user.twoFactorEnabled && (
												<span className="flex items-center gap-1 font-medium text-[10px] text-success">
													<ShieldCheck className="size-3" />
													{m.admin_users_2fa_active()}
												</span>
											)}
										</div>
									</TableCell>
									<TableCell>
										<UserStatus user={user} />
									</TableCell>
									<TableCell className="whitespace-nowrap text-muted-foreground text-xs">{formatDate(user.createdAt)}</TableCell>
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

								<ContextMenuContent className="w-64 border-border bg-popover shadow-xl">
									<ContextMenuGroup>
										<ContextMenuLabel className="truncate font-bold text-foreground text-xs uppercase tracking-wider">
											{user.name}
										</ContextMenuLabel>
									</ContextMenuGroup>
									<ContextMenuSeparator />
									<ContextMenuGroup>
										<ContextMenuItem onClick={() => detach(() => onToggleRole(user))} className="cursor-pointer gap-2.5">
											<Shield className="size-4 text-primary" />
											<span>{user.role === "admin" ? m.admin_users_revoke_admin() : m.admin_users_grant_admin()}</span>
										</ContextMenuItem>
										<ContextMenuItem onClick={() => detach(() => onToggleBan(user))} className="cursor-pointer gap-2.5">
											{user.banned ? <UserCheck className="size-4 text-success" /> : <UserRoundX className="size-4 text-warning" />}
											<span>{user.banned ? m.admin_users_unblock_account() : m.admin_users_block_account()}</span>
										</ContextMenuItem>
										<ContextMenuItem onClick={() => detach(() => onCopy(user.email, m.common_email()))} className="cursor-pointer gap-2.5">
											<Copy className="size-4 text-muted-foreground" />
											<span>{m.common_copy_email()}</span>
										</ContextMenuItem>
										<ContextMenuItem
											onClick={() => detach(() => onCopy(user.id, m.admin_users_user_id()))}
											className="cursor-pointer gap-2.5"
										>
											<Copy className="size-4 text-muted-foreground" />
											<span>{m.admin_users_copy_account_id()}</span>
										</ContextMenuItem>
									</ContextMenuGroup>
									<ContextMenuSeparator />
									<ContextMenuGroup>
										<ContextMenuItem
											onClick={() => detach(() => onDelete(user.id, user.name))}
											className="cursor-pointer gap-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive"
										>
											<Trash2 className="size-4" />
											<span>{m.admin_users_delete_account()}</span>
										</ContextMenuItem>
									</ContextMenuGroup>
								</ContextMenuContent>
							</ContextMenu>
						))}
					</TableBody>
				</Table>
			)}
			renderCard={(user) => (
				<ContextMenu key={user.id}>
					<ContextMenuTrigger render={<Card />}>
						<CardContent className="flex flex-col gap-4 p-4">
							<div className="flex items-start justify-between gap-3">
								<UserSummary user={user} />
								<UserStatus user={user} />
							</div>
							<div className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
								<span className="flex items-center gap-1">
									<Shield className="size-3.5 text-primary" />
									{user.role === "admin" ? m.admin_users_role_admin() : m.admin_users_role_user()}
								</span>
								{user.twoFactorEnabled && (
									<span className="flex items-center gap-1 font-medium text-success">
										<ShieldCheck className="size-3" /> {m.common_2fa_short()}
									</span>
								)}
								<span>{m.common_created_with_date({ date: formatDate(user.createdAt) })}</span>
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

					<ContextMenuContent className="w-64 border-border bg-popover shadow-xl">
						<ContextMenuGroup>
							<ContextMenuLabel className="truncate font-bold text-foreground text-xs uppercase tracking-wider">
								{user.name}
							</ContextMenuLabel>
						</ContextMenuGroup>
						<ContextMenuSeparator />
						<ContextMenuGroup>
							<ContextMenuItem onClick={() => detach(() => onToggleRole(user))} className="cursor-pointer gap-2.5">
								<Shield className="size-4 text-primary" />
								<span>{user.role === "admin" ? m.admin_users_revoke_admin() : m.admin_users_grant_admin()}</span>
							</ContextMenuItem>
							<ContextMenuItem onClick={() => detach(() => onToggleBan(user))} className="cursor-pointer gap-2.5">
								{user.banned ? <UserCheck className="size-4 text-success" /> : <UserRoundX className="size-4 text-warning" />}
								<span>{user.banned ? m.admin_users_unblock_account() : m.admin_users_block_account()}</span>
							</ContextMenuItem>
							<ContextMenuItem onClick={() => detach(() => onCopy(user.email, m.common_email()))} className="cursor-pointer gap-2.5">
								<Copy className="size-4 text-muted-foreground" />
								<span>{m.common_copy_email()}</span>
							</ContextMenuItem>
							<ContextMenuItem onClick={() => detach(() => onCopy(user.id, m.admin_users_user_id()))} className="cursor-pointer gap-2.5">
								<Copy className="size-4 text-muted-foreground" />
								<span>{m.common_copy_id()}</span>
							</ContextMenuItem>
						</ContextMenuGroup>
						<ContextMenuSeparator />
						<ContextMenuGroup>
							<ContextMenuItem
								onClick={() => detach(() => onDelete(user.id, user.name))}
								className="cursor-pointer gap-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive"
							>
								<Trash2 className="size-4" />
								<span>{m.admin_users_delete_account()}</span>
							</ContextMenuItem>
						</ContextMenuGroup>
					</ContextMenuContent>
				</ContextMenu>
			)}
		/>
	);
}
