import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { Ellipsis } from "lucide-react";
import { useHiddenPages } from "@/client/hooks/use-profiles";
import { m } from "@/paraglide/messages";
import { filterHiddenPages } from "@/utils/hidden-pages";
import { NAVBAR_LINKS, PRIMARY_MOBILE_LINK_COUNT } from "./navbar-links";
import { setNavbarMobileMenuOpen } from "./navbar-mobile-menu-store";

interface NavbarBottomBarProps {
	pathname: string;
}

export function NavbarBottomBar({ pathname }: NavbarBottomBarProps) {
	const isLinkActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

	const hiddenPages = useHiddenPages();
	const primaryLinks = filterHiddenPages(NAVBAR_LINKS, hiddenPages).slice(0, PRIMARY_MOBILE_LINK_COUNT);

	return (
		<div className="fixed inset-x-0 bottom-0 z-40 border-border border-t bg-background/90 backdrop-blur-md md:hidden">
			<div className="mx-auto flex max-w-md items-stretch gap-1 px-2 pt-1 pb-[calc(0.25rem+env(safe-area-inset-bottom))]">
				{primaryLinks.map(({ label, href, icon: Icon }) => {
					const isActive = isLinkActive(href);

					return (
						<Link
							key={href}
							to={href}
							aria-current={isActive ? "page" : undefined}
							className={cn(
								"flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-[10px] transition-colors",
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
				<button
					type="button"
					className="flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-[10px] text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
					onClick={() => setNavbarMobileMenuOpen(true)}
				>
					<Ellipsis className="size-5" aria-hidden="true" />
					<span>{m.components_app_navbar_more()}</span>
				</button>
			</div>
		</div>
	);
}
