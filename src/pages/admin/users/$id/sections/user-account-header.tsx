import { Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Copy, Shield, ShieldAlert, ShieldCheck, Users } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
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
		<header className="flex flex-col gap-5">
			<Button variant="ghost" className="-ml-4 w-fit gap-2 text-muted-foreground" nativeButton={false} render={<Link to="/admin/users" />}>
				<ArrowLeft className="size-4" />
				{m.admin_users_back_to_users()}
			</Button>
			<div>
				<p className="flex items-center gap-3 font-medium text-primary text-xs uppercase tracking-widest">
					<Users className="size-3.5" /> {m.admin_users_account_label()}
				</p>
				<div className="mt-3 flex flex-wrap items-center gap-3">
					<h1 className="font-semibold text-3xl tracking-tight sm:text-4xl">
						{m.admin_users_account_title({ name: user?.name ?? m.admin_users_account_label() })}
					</h1>
					{user && (
						<Badge variant="outline" className="gap-1 font-mono text-muted-foreground text-xs">
							<span>{m.admin_users_short_id({ id: user.id.slice(0, 8) })}</span>
							<button
								type="button"
								onClick={() => detach(copy(user.id, m.admin_users_copy_account_id()))}
								className="text-muted-foreground hover:text-foreground"
								aria-label={m.admin_users_copy_account_id()}
							>
								{hasCopied ? <Check className="size-3 text-primary" /> : <Copy className="size-3" />}
							</button>
						</Badge>
					)}
				</div>
				{user && (
					<div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-muted-foreground text-sm">
						<span className="font-medium text-foreground">{user.email}</span>
						<StatusBadge
							status={user.banned ? "error" : "success"}
							label={user.banned ? m.admin_users_blocked_status() : m.common_active()}
						/>
						<Badge variant={user.role === "admin" ? "default" : "secondary"} size="sm" className="gap-1">
							<Shield className="size-3" />
							{user.role === "admin" ? m.admin_users_role_admin() : m.admin_users_role_user()}
						</Badge>
						<Badge variant={user.twoFactorEnabled ? "outline" : "secondary"} size="sm" className="gap-1">
							{user.twoFactorEnabled ? (
								<>
									<ShieldCheck className="size-3 text-success" />
									<span className="text-success">{m.admin_users_2fa_active()}</span>
								</>
							) : (
								<>
									<ShieldAlert className="size-3 text-muted-foreground" />
									<span>{m.admin_users_no_2fa()}</span>
								</>
							)}
						</Badge>
						{user.createdAt && (
							<span className="text-muted-foreground text-xs">{m.common_created_at_value({ date: formatDateTime(user.createdAt) })}</span>
						)}
						{user.updatedAt && (
							<span className="text-muted-foreground text-xs">{m.common_updated_with_date({ date: formatDateTime(user.updatedAt) })}</span>
						)}
					</div>
				)}
				{user?.banned && (
					<div className="mt-3 flex items-start gap-2.5 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-destructive text-xs">
						<ShieldAlert className="mt-0.5 size-4 shrink-0" />
						<div>
							<p className="font-semibold">{m.admin_users_account_blocked()}</p>
							<p className="mt-0.5 text-muted-foreground">
								{m.admin_users_ban_reason_label({ reason: user.banReason ?? m.admin_users_no_ban_reason() })}
								{user.banExpires
									? m.admin_users_ban_expires({ date: formatDateTime(user.banExpires) })
									: ` ${m.admin_users_permanent_block()}`}
							</p>
						</div>
					</div>
				)}
			</div>
		</header>
	);
}
