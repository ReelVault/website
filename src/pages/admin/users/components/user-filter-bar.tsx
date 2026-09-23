import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminSearch } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";

interface UserFilterBarProps {
	search: string;
	onSearchChange: (value: string) => void;
	onOpenCreate: () => void;
}

export function UserFilterBar({ search, onSearchChange, onOpenCreate }: UserFilterBarProps) {
	return (
		<div className="flex flex-wrap items-center gap-3">
			<AdminSearch value={search} onChange={onSearchChange} placeholder={m.admin_users_search_placeholder()} />
			<Button onClick={onOpenCreate} className="gap-2">
				<UserPlus className="size-4" /> {m.app_create_account()}
			</Button>
		</div>
	);
}
