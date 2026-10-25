import { Shield, ShieldAlert, ShieldCheck, Users } from "lucide-react";
import { CopyIcon } from "@/components/copy-icon";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { detach } from "@/lib/detach";
import { AdminBackLink, AdminPageHeader } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { useCopyToClipboard } from "@/utils/clipboard-utils";
import { formatDateTime } from "@/utils/format-utils";

interface UserAccountHeaderProps {
	user?: {
		id: string;
		name: string;
		email: string;
		role: "admin" | "user";
		banned: boolean;
		banReason?: string | null;
		banExpires?: Date | string | null;
		twoFactorEnabled?: boolean;
		createdAt?: Date | string | null;
		updatedAt?: Date | string | null;
	} | null;
}

export function UserAccountHeader({ user }: UserAccountHeaderProps) {
	const { hasCopied, copy } = useCopyToClipboard();

	return (
		<>
			<AdminBackLink to="/admin/users" label={m.admin_users_back_to_users()} />

			<AdminPageHeader
				icon={Users}
				eyebrow={m.admin_users_account_label()}
				title={m.admin_users_account_title({ name: user?.name ?? m.admin_users_account_label() })}
				badge={
					user && (
						<Badge tone="muted" variant="outline" font="mono">
							<span>{m.admin_users_short_id({ id: user.id.slice(0, 8) })}</span>
							<button
								type="button"
								onClick={() => detach(copy(user.id, m.admin_users_copy_account_id()))}
								className="text-muted-foreground hover:text-foreground -m-3.5 p-3.5 sm:m-0 sm:p-0"
								aria-label={m.admin_users_copy_account_id()}
							>
								<CopyIcon copied={hasCopied} className="size-3" copiedClassName="text-primary" />
							</button>
						</Badge>
					)
				}
				description={
					user && (
						<div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
							<span className="text-foreground font-medium">{user.email}</span>
							<StatusBadge
								status={user.banned ? "error" : "success"}
								label={user.banned ? m.admin_users_blocked_status() : m.common_active()}
							/>
							<Badge variant={user.role === "admin" ? "default" : "secondary"} size="sm">
								<Shield className="size-3" />
								{user.role === "admin" ? m.admin_users_role_admin() : m.admin_users_role_user()}
							</Badge>
							<Badge variant={user.twoFactorEnabled ? "outline" : "secondary"} size="sm">
								{user.twoFactorEnabled ? (
									<>
										<ShieldCheck className="text-success size-3" />
										<span className="text-success">{m.admin_users_2fa_active()}</span>
									</>
								) : (
									<>
										<ShieldAlert className="text-muted-foreground size-3" />
										<span>{m.admin_users_no_2fa()}</span>
									</>
								)}
							</Badge>
							{user.createdAt && <span className="text-xs">{m.common_created_at_value({ date: formatDateTime(user.createdAt) })}</span>}
							{user.updatedAt && <span className="text-xs">{m.common_updated_with_date({ date: formatDateTime(user.updatedAt) })}</span>}
						</div>
					)
				}
			/>

			{user?.banned && (
				<div className="border-destructive/40 bg-destructive/10 text-destructive flex items-start gap-2.5 rounded-xl border p-3 text-xs">
					<ShieldAlert className="mt-0.5 size-4 shrink-0" />
					<div>
						<p className="font-semibold">{m.admin_users_account_blocked()}</p>
						<p className="text-muted-foreground mt-0.5">
							{m.admin_users_ban_reason_label({ reason: user.banReason ?? m.admin_users_no_ban_reason() })}
							{user.banExpires
								? m.admin_users_ban_expires({ date: formatDateTime(user.banExpires) })
								: ` ${m.admin_users_permanent_block()}`}
						</p>
					</div>
				</div>
			)}
		</>
	);
}
