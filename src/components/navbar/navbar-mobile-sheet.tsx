import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { Menu } from "lucide-react";
import { useOverlayHistory } from "@/hooks/use-overlay-history";
import { m } from "@/paraglide/messages";
import { Button } from "../ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { setNavbarMobileMenuOpen, useNavbarMobileMenu } from "./navbar-mobile-menu-store";
import { NavbarProfile } from "./navbar-profile";
import { useNavbarEntries } from "./use-navbar-entries";

export function NavbarMobileSheet() {
	const open = useNavbarMobileMenu();
	const { core, plugins } = useNavbarEntries();
	useOverlayHistory(open, () => setNavbarMobileMenuOpen(false));

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
					{[...core, ...plugins].map(({ href, label, Icon, isActive }) => (
						<SheetClose key={href} nativeButton={false} render={<Link to={href} aria-current={isActive ? "page" : undefined} />}>
							<span
								className={cn(
									"flex min-h-11 items-center gap-3 rounded-lg border-l-2 px-3 text-sm font-medium",
									isActive ? "border-primary bg-muted text-foreground" : "text-muted-foreground border-transparent",
								)}
							>
								<Icon aria-hidden="true" />
								{label}
							</span>
						</SheetClose>
					))}
					<div className="border-border mt-2 rounded-lg border p-2">
						<NavbarProfile />
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
