import { Link, useNavigate, useRouter as useTanStackRouter } from "@tanstack/react-router";
import { LogOut, Monitor, MonitorSmartphone, Settings, Shield, Unplug, User, Users } from "lucide-react";
import { startTransition } from "react";
import { resolveApiAssetUrl } from "@/client/client";
import { useLogout } from "@/client/hooks/use-auth";
import { useCurrentUser } from "@/client/hooks/use-current-profile";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { m } from "@/paraglide/messages";
import { PluginSlotHost } from "@/plugin-host/slot-host";
import { toast } from "@/utils/toast-facade";

export function NavbarProfile() {
	const navigate = useNavigate();
	const router = useTanStackRouter();
	const { profile, user, isLoading } = useCurrentUser();
	const logoutMutation = useLogout();

	const handleLogout = (): void => {
		// Transition consumes the async logout + navigation without a floating chain.
		startTransition(async () => {
			try {
				await logoutMutation.mutateAsync();
				await navigate({ to: "/auth/login", replace: true });
				await router.invalidate();
			} catch {
				toast.error(m.components_navbar_logout_failed());
			}
		});
	};

	const profileName = profile?.name ?? m.components_navbar_select_profile();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="group flex items-center gap-3 rounded-2xl pl-3 hover:cursor-pointer hover:bg-muted">
				<div className="flex flex-col items-end text-left">
					<span className="font-semibold text-foreground text-sm">
						{isLoading && m.common_loading_dots()}
						{!isLoading && profileName}
					</span>
					{/* "Pro Plan" badge — commented out until a Pro Plan plugin exists. */}
					{/* <Badge className="mt-0.5 flex items-center gap-1 px-2 py-0.5 text-xs">
						<Crown className="size-3 text-secondary-foreground" />
						Pro Plan
					</Badge> */}
				</div>

				<Avatar className="size-9 ring-2 ring-background transition-shadow group-hover:ring-primary/50">
					<AvatarImage src={resolveApiAssetUrl(profile?.avatarUrl)} alt={profileName} />
					<AvatarFallback className="bg-muted text-muted-foreground">
						<User className="size-5" />
					</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" sideOffset={12} className="w-72 rounded-2xl border-border bg-popover/90 shadow-2xl">
				<DropdownMenuGroup>
					<DropdownMenuLabel className="p-4">
						<div className="flex items-center gap-4">
							<Avatar className="size-12">
								<AvatarImage src={resolveApiAssetUrl(profile?.avatarUrl)} />
								<AvatarFallback className="bg-muted">
									<User className="size-6" />
								</AvatarFallback>
							</Avatar>
							<div>
								<p className="font-bold text-foreground">{profileName}</p>
								<p className="text-muted-foreground text-sm">{m.common_active_profile()}</p>
							</div>
						</div>
					</DropdownMenuLabel>
				</DropdownMenuGroup>

				<DropdownMenuSeparator className="bg-border/30" />

				<DropdownMenuGroup>
					{/* Plugin profile-menu slot — contributions from ui.json (no per-plugin code). */}
					<PluginSlotHost name="navbar-profile-menu" />

					<Link to={"/remote"}>
						<DropdownMenuItem className="gap-3 rounded-xl px-4 py-3 text-sm hover:cursor-pointer hover:bg-muted">
							<MonitorSmartphone className="size-4 text-muted-foreground" />
							{m.user_remote_pilot_heading()}
						</DropdownMenuItem>
					</Link>

					<Link to={"/quick-connect"}>
						<DropdownMenuItem className="gap-3 rounded-xl px-4 py-3 text-sm hover:cursor-pointer hover:bg-muted">
							<Unplug className="size-4 text-muted-foreground" />
							{m.components_navbar_quick_connect()}
						</DropdownMenuItem>
					</Link>

					<Link to={"/devices"}>
						<DropdownMenuItem className="gap-3 rounded-xl px-4 py-3 text-sm hover:cursor-pointer hover:bg-muted">
							<Monitor className="size-4 text-muted-foreground" />
							{m.components_navbar_my_devices()}
						</DropdownMenuItem>
					</Link>

					<Link to={"/settings"}>
						<DropdownMenuItem className="gap-3 rounded-xl px-4 py-3 text-sm hover:cursor-pointer hover:bg-muted">
							<Settings className="size-4 text-muted-foreground" />
							{m.navbar_settings()}
						</DropdownMenuItem>
					</Link>

					{user?.role === "admin" && (
						<Link to={"/admin"}>
							<DropdownMenuItem className="gap-3 rounded-xl px-4 py-3 text-primary text-sm hover:cursor-pointer hover:bg-primary/10">
								<Shield className="size-4" />
								{m.navbar_admin_panel()}
							</DropdownMenuItem>
						</Link>
					)}
				</DropdownMenuGroup>

				<DropdownMenuSeparator className="bg-border/30" />

				<DropdownMenuGroup>
					<Link to={"/auth/profiles"}>
						<DropdownMenuItem className="gap-3 rounded-xl px-4 py-3 text-sm hover:cursor-pointer hover:bg-muted">
							<Users className="size-4 text-muted-foreground" />
							{m.components_navbar_change_profile()}
						</DropdownMenuItem>
					</Link>

					<DropdownMenuItem
						disabled={logoutMutation.isPending}
						onClick={handleLogout}
						className="gap-3 rounded-xl px-4 py-3 text-destructive text-sm hover:cursor-pointer hover:bg-destructive/10"
					>
						<LogOut className="size-4" />
						{logoutMutation.isPending ? m.components_navbar_logging_out() : m.components_navbar_log_out()}
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
