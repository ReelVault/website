import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { Menu } from "lucide-react";
import { resolvePluginText, usePluginNavPages } from "@/client/hooks/use-plugin-ui";
import { useOverlayHistory } from "@/hooks/use-overlay-history";
import { m } from "@/paraglide/messages";
import { getPluginIcon } from "@/plugin-host/icons";
import { Button } from "../ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { NAVBAR_LINKS } from "./navbar-links";
import { setNavbarMobileMenuOpen, useNavbarMobileMenu } from "./navbar-mobile-menu-store";
import { NavbarProfile } from "./navbar-profile";

interface NavbarMobileSheetProps {
	pathname: string;
}

export function NavbarMobileSheet({ pathname }: NavbarMobileSheetProps) {
	const open = useNavbarMobileMenu();
	const { pages: pluginNavPages } = usePluginNavPages("user");
	useOverlayHistory(open, () => setNavbarMobileMenuOpen(false));
	const isLinkActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

	return (
		<Sheet open={open} onOpenChange={setNavbarMobileMenuOpen}>
			<SheetTrigger
				render={
					<Button
						variant="ghost"
						size="icon-lg"
						aria-label={m.components_navbar_open_mobile_menu()}
						className="xl:hidden"
						onClick={() => setNavbarMobileMenuOpen(true)}
					/>
				}
			>
				<Menu data-icon="inline-start" aria-hidden="true" />
			</SheetTrigger>
			<SheetContent side="right" className="w-[min(22rem,calc(100vw-2rem))]">
				<SheetHeader>
					<SheetTitle>{m.common_brand_name()}</SheetTitle>
					<SheetDescription>{m.components_navbar_catalog_tagline()}</SheetDescription>
				</SheetHeader>
				<div className="flex flex-col gap-2 px-4">
					{NAVBAR_LINKS.map(({ label, href, icon: Icon }) => {
						const isActive = isLinkActive(href);

						return (
							<SheetClose key={href} render={<Link to={href} aria-current={isActive ? "page" : undefined} />}>
								<span
									className={cn(
										"flex min-h-11 items-center gap-3 rounded-lg border-l-2 px-3 font-medium text-sm",
										isActive ? "border-primary bg-muted text-foreground" : "border-transparent text-muted-foreground",
									)}
								>
									<Icon aria-hidden="true" />
									{label}
								</span>
							</SheetClose>
						);
					})}
					{/* PLUGIN LINKS (nav:"user") — render nothing when no plugin advertises a page */}
					{pluginNavPages.map((page) => {
						const href = `/plugins/${page.pluginId}/page/${page.path}`;
						const Icon = getPluginIcon(page.icon);
						const isActive = isLinkActive(href);

						return (
							<SheetClose key={href} render={<Link to={href} aria-current={isActive ? "page" : undefined} />}>
								<span
									className={cn(
										"flex min-h-11 items-center gap-3 rounded-lg border-l-2 px-3 font-medium text-sm",
										isActive ? "border-primary bg-muted text-foreground" : "border-transparent text-muted-foreground",
									)}
								>
									<Icon aria-hidden="true" />
									{resolvePluginText(page.name, page.defaultLocale)}
								</span>
							</SheetClose>
						);
					})}
					<div className="mt-2 rounded-lg border border-border p-2">
						<NavbarProfile />
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
