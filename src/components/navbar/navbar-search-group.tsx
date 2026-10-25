import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { type MouseEvent, useEffect } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { detach } from "@/lib/detach";
import { GLOBAL_SEARCH_INPUT_ID } from "@/lib/global-search";
import { m } from "@/paraglide/messages";
import { Button } from "../ui/button";

const DESKTOP_SEARCH_QUERY = "(min-width: 1536px)";

/**
 * Search entry point in the navbar. The search lives on its own page so results
 * get the full viewport; Ctrl+K opens it from anywhere.
 */
export function NavbarSearchGroup() {
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const isDesktopSearch = useMediaQuery(DESKTOP_SEARCH_QUERY);
	const isActive = pathname === "/search";

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (!((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k")) {
				return;
			}

			event.preventDefault();
			if (isActive) {
				document.getElementById(GLOBAL_SEARCH_INPUT_ID)?.focus();
				return;
			}

			detach(navigate({ to: "/search" }));
		};
		window.addEventListener("keydown", handleKeyDown);

		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isActive, navigate]);

	const label = m.components_search_open_shortcut();
	const activeProps = isActive ? { "aria-current": "page" as const } : {};
	const handleSearchLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
		if (!isActive || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

		event.preventDefault();
		document.getElementById(GLOBAL_SEARCH_INPUT_ID)?.focus();
	};

	return (
		<>
			<Button
				aria-label={label}
				aria-keyshortcuts="Control+K"
				variant="ghost"
				size="icon-lg"
				className="2xl:hidden"
				nativeButton={false}
				render={<Link to="/search" onClick={handleSearchLinkClick} {...activeProps} />}
			>
				<Search data-icon="inline-start" aria-hidden="true" />
			</Button>
			<div className={isDesktopSearch ? "hidden 2xl:block" : "hidden"}>
				<Button
					aria-label={label}
					aria-keyshortcuts="Control+K"
					variant="outline"
					size="sm"
					className="flex items-center"
					nativeButton={false}
					render={<Link to="/search" onClick={handleSearchLinkClick} {...activeProps} />}
				>
					<Search className="text-muted-foreground group-hover:text-primary size-4 transition-colors" />
					<span className="font-medium">{m.components_navbar_search_catalog()}</span>
					<kbd className="border-border bg-card text-muted-foreground hidden items-center gap-0.5 rounded-md border px-1.5 py-0.5 font-mono text-xs shadow-xs sm:inline-flex">
						{m.common_shortcut_ctrl_k()}
					</kbd>
				</Button>
			</div>
		</>
	);
}
