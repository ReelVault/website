import { Link, useLocation, useNavigate, useRouter as useTanStackRouter } from "@tanstack/react-router";
import { UserRound } from "lucide-react";
import { useState } from "react";
import { resolveApiAssetUrl } from "@/client/client";
import { useLogout } from "@/client/hooks/use-auth";
import { useCurrentUser } from "@/client/hooks/use-current-profile";
import { useUnreadNotificationCount } from "@/client/hooks/use-notifications";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { m } from "@/paraglide/messages";
import { UserSidebarDesktopFooter } from "./sidebar/user-sidebar-desktop-footer";
import { UserSidebarMobileSheet } from "./sidebar/user-sidebar-mobile-sheet";
import { UserSidebarNav } from "./sidebar/user-sidebar-nav";

export function UserSidebar() {
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const router = useTanStackRouter();
	const { user: account, profile, isLoading } = useCurrentUser();
	const { data } = useUnreadNotificationCount();
	const logout = useLogout();
	const [profileSheetOpen, setProfileSheetOpen] = useState(false);

	const handleLogout = async () => {
		await logout.mutateAsync();
		await navigate({ to: "/auth/login", replace: true });
		await router.invalidate();
	};

	return (
		<aside className="fixed inset-x-0 bottom-0 z-40 border-border/70 border-t bg-background/95 lg:inset-y-0 lg:right-auto lg:z-auto lg:w-64 lg:border-t-0 lg:border-r">
			<div className="mx-auto flex h-16 max-w-xl items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] lg:flex lg:h-full lg:max-w-none lg:flex-col lg:items-stretch lg:justify-start lg:gap-8 lg:px-5 lg:py-6 lg:pb-0">
				<Link
					to="/"
					className="mx-auto hidden items-center gap-3 px-2 lg:flex lg:items-center lg:justify-center"
					aria-label={m.user_back_to_reelvault()}
				>
					<Logo className="h-7 w-auto" />
				</Link>

				<div className="hidden border-border/60 border-y py-4 lg:block">
					{isLoading ? (
						<Skeleton className="h-11 rounded-xl" />
					) : (
						<div className="flex items-center gap-3 px-2">
							<Avatar className="size-10 shrink-0 rounded-xl">
								<AvatarImage src={resolveApiAssetUrl(profile?.avatarUrl)} alt="" />
								<AvatarFallback className="rounded-xl bg-primary/10 text-primary">
									<UserRound aria-hidden="true" />
								</AvatarFallback>
							</Avatar>
							<div className="min-w-0">
								<p className="truncate font-semibold text-sm">{profile?.name ?? m.user_your_profile()}</p>
								<p className="truncate text-muted-foreground text-xs">{account?.email ?? m.common_active_profile()}</p>
							</div>
						</div>
					)}
				</div>

				<UserSidebarNav pathname={pathname} unreadCount={data?.count ?? 0} />

				<UserSidebarDesktopFooter onLogout={handleLogout} />

				<UserSidebarMobileSheet
					open={profileSheetOpen}
					onOpenChange={setProfileSheetOpen}
					account={account}
					profile={profile}
					isLoading={isLoading}
					onLogout={handleLogout}
				/>
			</div>
		</aside>
	);
}
