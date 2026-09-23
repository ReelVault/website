import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "cn";
import { resolvePluginText, usePluginNavPages } from "@/client/hooks/use-plugin-ui";
import { RealtimeStatusIndicator } from "@/components/realtime-status-indicator";
import { getPluginIcon } from "@/plugin-host/icons";
import { Logo } from "../logo";
import { NavbarBottomBar } from "./navbar-bottom-bar";
import { NAVBAR_LINKS, PRIMARY_MOBILE_LINKS } from "./navbar-links";
import { NavbarLocaleSwitcher } from "./navbar-locale-switcher";
import { NavbarMobileSheet } from "./navbar-mobile-sheet";
import { NavbarNotifications } from "./navbar-notifications";
import { NavbarProfile } from "./navbar-profile";
import { NavbarSearchGroup } from "./navbar-search-group";

export function AppNavbar() {
	const { pathname } = useLocation();
	const { pages: pluginNavPages } = usePluginNavPages("user");

	const isLinkActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

	return (
		<nav
			className={cn(
				"fixed inset-x-0 top-0 z-40 border-border border-b bg-background/80 transition-[background-color,border-color] duration-300 xl:py-2",
			)}
		>
			<div className="mx-auto flex h-14 w-full items-center px-4 sm:px-6 lg:px-24 xl:h-11">
				<Link to="/dashboard" className="group flex min-h-11 items-center gap-2.5" aria-label="ReelVault — dashboard">
					<Logo className="h-7 w-auto transition-transform group-hover:scale-[1.02]" />
				</Link>

				<div className="ml-8 hidden w-full items-center justify-center gap-1 md:flex xl:hidden">
					{PRIMARY_MOBILE_LINKS.map(({ label, href, icon: Icon }) => {
						const isActive = isLinkActive(href);

						return (
							<Link
								key={href}
								to={href}
								aria-current={isActive ? "page" : undefined}
								className={cn(
									"flex min-h-12 max-w-24 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-[10px] transition-colors",
									{
										"bg-muted text-primary": isActive,
										"text-muted-foreground hover:bg-muted/40 hover:text-foreground": !isActive,
									},
								)}
							>
								<Icon className="size-5" aria-hidden="true" />
								<span>{label}</span>
							</Link>
						);
					})}
				</div>

				<div className="ml-8 hidden items-center gap-1 xl:flex">
					{NAVBAR_LINKS.map(({ label, href, icon: Icon }) => {
						const isActive = isLinkActive(href);

						return (
							<Link
								key={href}
								to={href}
								aria-current={isActive ? "page" : undefined}
								className={cn(
									"flex min-h-11 items-center gap-2 rounded-lg border-l-2 px-3 font-medium text-sm transition-[background-color,color,border-color]",
									{
										"border-primary bg-muted text-foreground": isActive,
										"border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground": !isActive,
									},
								)}
							>
								<Icon aria-hidden="true" />
								{label}
							</Link>
						);
					})}
					{/* PLUGIN LINKS (nav:"user") — render nothing when no plugin advertises a page */}
					{pluginNavPages.map((page) => {
						const href = `/plugins/${page.pluginId}/page/${page.path}`;
						const Icon = getPluginIcon(page.icon);
						const isActive = isLinkActive(href);

						return (
							<Link
								key={href}
								to={href}
								aria-current={isActive ? "page" : undefined}
								className={cn(
									"flex min-h-11 items-center gap-2 rounded-lg border-l-2 px-3 font-medium text-sm transition-[background-color,color,border-color]",
									{
										"border-primary bg-muted text-foreground": isActive,
										"border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground": !isActive,
									},
								)}
							>
								<Icon aria-hidden="true" />
								{resolvePluginText(page.name, page.defaultLocale)}
							</Link>
						);
					})}
				</div>

				<div className="ml-auto flex items-center gap-2">
					<RealtimeStatusIndicator />

					<NavbarSearchGroup />

					<NavbarNotifications />

					<NavbarLocaleSwitcher />

					<div className="hidden xl:block">
						<NavbarProfile />
					</div>

					<NavbarMobileSheet pathname={pathname} />
				</div>
			</div>

			{/* Bottom navigation bar — below xl only. */}
			<NavbarBottomBar pathname={pathname} />
		</nav>
	);
}
