import { useLocation } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { Button } from "../ui/button";

// cmdk and the whole command palette are interaction-only. Keeping them in a
// lazy chunk removes them from the eager navbar graph; below the 2xl breakpoint
// the palette is reachable only via Ctrl+K or the icon, so it is not mounted
// (nor fetched) until then.
const loadNavbarSearch = () => import("./navbar-search");
const NavbarSearch = lazy(async () => {
	const mod = await loadNavbarSearch();

	return { default: mod.NavbarSearch };
});

const DESKTOP_SEARCH_QUERY = "(min-width: 1536px)";

/**
 * Search icon button + full search field in one — open state, the Ctrl+K shortcut
 * and close-on-navigate live here so opening the search does not
 * re-render the whole navbar.
 */
export function NavbarSearchGroup() {
	const { pathname } = useLocation();
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const isDesktopSearch = useMediaQuery(DESKTOP_SEARCH_QUERY);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
				event.preventDefault();
				detach(loadNavbarSearch());
				setIsSearchOpen(true);
			}
		};
		window.addEventListener("keydown", handleKeyDown);

		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	// Close the search on page change (navigating by clicking a card).
	// Adjusting state during render (react.dev "adjusting state when props change")
	// closes the overlay in the same pass as the navigation, without an effect.
	const [prevPathname, setPrevPathname] = useState(pathname);
	if (pathname !== prevPathname) {
		setPrevPathname(pathname);
		setIsSearchOpen(false);
	}

	return (
		<>
			<Button
				aria-label={m.components_search_open_shortcut()}
				variant="ghost"
				size="icon-lg"
				className="2xl:hidden"
				onClick={() => {
					detach(loadNavbarSearch());
					setIsSearchOpen(true);
				}}
			>
				<Search data-icon="inline-start" aria-hidden="true" />
			</Button>
			{(isDesktopSearch || isSearchOpen) && (
				<div className={isDesktopSearch ? "hidden 2xl:block" : "hidden"}>
					<Suspense fallback={null}>
						<NavbarSearch isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} />
					</Suspense>
				</div>
			)}
		</>
	);
}
