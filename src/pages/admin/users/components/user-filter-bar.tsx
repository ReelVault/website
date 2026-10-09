import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminSearch } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";

interface UserFilterBarProps {
	search: string;
	onSearchChange: (value: string) => void;
	role: "admin" | "user" | undefined;
	onRoleChange: (value: "admin" | "user" | undefined) => void;
	status: "active" | "blocked" | undefined;
	onStatusChange: (value: "active" | "blocked" | undefined) => void;
	onOpenCreate: () => void;
}

export function UserFilterBar({ search, onSearchChange, role, onRoleChange, status, onStatusChange, onOpenCreate }: UserFilterBarProps) {
	return (
		<div className="flex flex-wrap items-center gap-3">
			<AdminSearch value={search} onChange={onSearchChange} placeholder={m.admin_users_search_placeholder()} />
			<Select value={role ?? ""} onValueChange={(value) => onRoleChange(value === "admin" || value === "user" ? value : undefined)}>
				<SelectTrigger className="w-40" aria-label={m.admin_users_role_label()}>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectItem value="">{m.admin_users_filter_all_roles()}</SelectItem>
						<SelectItem value="admin">{m.admin_users_role_admin()}</SelectItem>
						<SelectItem value="user">{m.admin_users_role_user()}</SelectItem>
					</SelectGroup>
				</SelectContent>
			</Select>
			<Select value={status ?? ""} onValueChange={(value) => onStatusChange(value === "active" || value === "blocked" ? value : undefined)}>
				<SelectTrigger className="w-40" aria-label={m.admin_users_filter_status()}>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectItem value="">{m.admin_users_filter_all_statuses()}</SelectItem>
						<SelectItem value="active">{m.admin_users_status_active()}</SelectItem>
						<SelectItem value="blocked">{m.admin_users_blocked_status()}</SelectItem>
					</SelectGroup>
				</SelectContent>
			</Select>
			<Button onClick={onOpenCreate} className="gap-2">
				<UserPlus className="size-4" /> {m.app_create_account()}
			</Button>
		</div>
	);
}
