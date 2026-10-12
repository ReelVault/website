import { Link, useNavigate, useRouter as useTanStackRouter } from "@tanstack/react-router";
import { LogOut, Monitor, MonitorSmartphone, Settings, Shield, Unplug, User, Users } from "lucide-react";
import { startTransition } from "react";
import { resolveApiAssetUrl } from "@/client/client";
import { useLogout } from "@/client/hooks/use-auth";
import { useCurrentUser } from "@/client/hooks/use-current-profile";
import { isAdminUser } from "@/components/auth/admin-access";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { PluginSlotHost } from "@/plugin-host/slot-host.lazy";
import { toast } from "@/utils/toast-facade";

export function NavbarProfile() {
	const navigate = useNavigate();
	const router = useTanStackRouter();
	const { profile, user } = useCurrentUser();
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
			<DropdownMenuTrigger render={<Button variant="ghost" size="icon-lg" aria-label={profileName} />}>
				<Avatar className="size-7 group-hover:ring-primary/50">
					<AvatarImage src={resolveApiAssetUrl(profile?.avatarUrl)} alt={profileName} />
					<AvatarFallback>
						<User className="size-5" />
					</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" sideOffset={12} size="lg">
				<DropdownMenuGroup>
					<DropdownMenuLabel size="lg">
						<div className="flex items-center gap-4">
							<Avatar className="size-12">
								<AvatarImage src={resolveApiAssetUrl(profile?.avatarUrl)} />
								<AvatarFallback>
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

				<DropdownMenuSeparator />

				<DropdownMenuGroup>
					{/* Plugin profile-menu slot — contributions from ui.json (no per-plugin code). */}
					<PluginSlotHost name="navbar-profile-menu" menuItemSize="lg" />

					<Link to={"/remote"}>
						<DropdownMenuItem size="lg">
							<MonitorSmartphone className="size-4 text-muted-foreground" />
							{m.user_remote_pilot_heading()}
						</DropdownMenuItem>
					</Link>

					<Link to={"/quick-connect"}>
						<DropdownMenuItem size="lg">
							<Unplug className="size-4 text-muted-foreground" />
							{m.components_navbar_quick_connect()}
						</DropdownMenuItem>
					</Link>

					<Link to={"/devices"}>
						<DropdownMenuItem size="lg">
							<Monitor className="size-4 text-muted-foreground" />
							{m.components_navbar_my_devices()}
						</DropdownMenuItem>
					</Link>

					<Link to={"/settings"}>
						<DropdownMenuItem size="lg">
							<Settings className="size-4 text-muted-foreground" />
							{m.navbar_settings()}
						</DropdownMenuItem>
					</Link>

					{isAdminUser(user) && (
						<Link to={"/admin"}>
							<DropdownMenuItem size="lg">
								<Shield className="size-4" />
								{m.navbar_admin_panel()}
							</DropdownMenuItem>
						</Link>
					)}
				</DropdownMenuGroup>

				<DropdownMenuSeparator />

				<DropdownMenuGroup>
					<Link to={"/auth/profiles"}>
						<DropdownMenuItem size="lg">
							<Users className="size-4 text-muted-foreground" />
							{m.components_navbar_change_profile()}
						</DropdownMenuItem>
					</Link>

					<DropdownMenuItem size="lg" disabled={logoutMutation.isPending} onClick={handleLogout} variant="destructive">
						<LogOut className="size-4" />
						{logoutMutation.isPending ? m.components_navbar_logging_out() : m.components_navbar_log_out()}
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
