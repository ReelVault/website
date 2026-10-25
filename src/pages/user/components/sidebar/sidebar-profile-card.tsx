import { UserRound } from "lucide-react";
import { resolveApiAssetUrl } from "@/client/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { m } from "@/paraglide/messages";

interface SidebarProfileCardProps {
	profile?: { name?: string | null; avatarUrl?: string | null } | null;
	account?: { email?: string | null } | null;
}

/** Profile identity card shared by the desktop sidebar and the mobile sheet. */
export function SidebarProfileCard({ profile, account }: SidebarProfileCardProps) {
	return (
		<div className="border-border/60 mb-2 flex items-center gap-3 rounded-xl border p-3">
			<Avatar className="size-10 shrink-0 after:hidden">
				<AvatarImage src={resolveApiAssetUrl(profile?.avatarUrl)} alt="" />
				<AvatarFallback>
					<UserRound aria-hidden="true" />
				</AvatarFallback>
			</Avatar>
			<div className="min-w-0">
				<p className="truncate text-sm font-semibold">{profile?.name ?? m.user_your_profile()}</p>
				<p className="text-muted-foreground truncate text-xs">{account?.email ?? m.user_active_profile()}</p>
			</div>
		</div>
	);
}
