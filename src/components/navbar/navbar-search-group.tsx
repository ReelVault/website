import { useLocation } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { m } from "@/paraglide/messages";
import { Button } from "../ui/button";
import { NavbarSearch } from "./navbar-search";

/**
 * Search icon button + full search field in one — open state, the Ctrl+K shortcut
 * and close-on-navigate live here so opening the search does not
 * re-render the whole navbar.
 */
export function NavbarSearchGroup() {
	const { pathname } = useLocation();
	const [isSearchOpen, setIsSearchOpen] = useState(false);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
				event.preventDefault();
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
				onClick={() => setIsSearchOpen(true)}
			>
				<Search data-icon="inline-start" aria-hidden="true" />
			</Button>
			<div className="hidden 2xl:block">
				<NavbarSearch isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} />
			</div>
		</>
	);
}
