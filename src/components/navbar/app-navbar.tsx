import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "cn";
import { RealtimeStatusIndicator } from "@/components/realtime-status-indicator";
import { m } from "@/paraglide/messages";
import { Logo } from "../logo";
import { NavbarBottomBar } from "./navbar-bottom-bar";
import { NavbarDownloadsIndicator } from "./navbar-downloads-indicator";
import { PRIMARY_MOBILE_LINK_COUNT } from "./navbar-links";
import { NavbarLocaleSwitcher } from "./navbar-locale-switcher";
import { NavbarMobileSheet } from "./navbar-mobile-sheet";
import { NavbarNotifications } from "./navbar-notifications";
import { NavbarProfile } from "./navbar-profile";
import { NavbarSearchGroup } from "./navbar-search-group";
import { useNavbarEntries } from "./use-navbar-entries";

export function AppNavbar() {
	const { pathname } = useLocation();
	const { core, plugins } = useNavbarEntries();

	return (
		<nav
			className={cn(
				"border-border bg-background/80 fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color] duration-300 xl:py-2",
			)}
		>
			<div className="mx-auto flex h-14 w-full items-center px-4 sm:px-6 lg:px-8 xl:h-11 2xl:px-24">
				<Link to="/dashboard" className="group flex min-h-11 items-center gap-2.5" aria-label={m.web_navbar_home_aria()}>
					<Logo className="h-7 w-auto transition-transform group-hover:scale-[1.02]" />
				</Link>

				<div className="ml-8 hidden w-full items-center justify-center gap-1 md:flex xl:hidden">
					{core.slice(0, PRIMARY_MOBILE_LINK_COUNT).map(({ href, label, Icon, isActive }) => (
						<Link
							key={href}
							to={href}
							aria-current={isActive ? "page" : undefined}
							className={cn(
								"flex min-h-12 max-w-24 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-xs transition-colors",
								{
									"bg-muted text-primary": isActive,
									"text-muted-foreground hover:bg-muted/40 hover:text-foreground": !isActive,
								},
							)}
						>
							<Icon className="size-5" aria-hidden="true" />
							<span>{label}</span>
						</Link>
					))}
				</div>

				<div className="ml-8 hidden items-center gap-1 xl:flex">
					{[...core, ...plugins].map(({ href, label, Icon, isActive }) => (
						<Link
							key={href}
							to={href}
							aria-current={isActive ? "page" : undefined}
							className={cn(
								"flex min-h-11 items-center gap-2 rounded-lg border-l-2 px-2.5 text-sm font-medium whitespace-nowrap transition-[background-color,color,border-color] 2xl:px-3",
								{
									"border-primary bg-muted text-foreground": isActive,
									"text-muted-foreground hover:bg-muted/60 hover:text-foreground border-transparent": !isActive,
								},
							)}
						>
							<Icon aria-hidden="true" />
							{label}
						</Link>
					))}
				</div>

				<div className="ml-auto flex items-center gap-2">
					<RealtimeStatusIndicator />

					<NavbarSearchGroup />

					<NavbarDownloadsIndicator />

					<NavbarNotifications />

					<NavbarLocaleSwitcher />

					<div className="hidden xl:block">
						<NavbarProfile />
					</div>

					<NavbarMobileSheet />
				</div>
			</div>

			{/* Bottom navigation bar — below xl only. */}
			<NavbarBottomBar pathname={pathname} />
		</nav>
	);
}
