import { useLocation } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { resolvePluginText, usePluginNavPages } from "@/client/hooks/use-plugin-ui";
import { useHiddenPages } from "@/client/hooks/use-profiles";
import { getPluginIcon } from "@/plugin-host/icons";
import { filterHiddenPages } from "@/utils/hidden-pages";
import { NAVBAR_LINKS } from "./navbar-links";

/** One menu entry, resolved for the current route. Core entries come first, then plugin pages. */
export interface NavbarEntry {
	href: string;
	label: string;
	Icon: LucideIcon;
	isActive: boolean;
}

/** Menu entries shared by the top navbar and the mobile sheet. */
export function useNavbarEntries(): { core: NavbarEntry[]; plugins: NavbarEntry[] } {
	const { pathname } = useLocation();
	const { pages: pluginNavPages } = usePluginNavPages("user");
	const hiddenPages = useHiddenPages();
	const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

	const core = filterHiddenPages(NAVBAR_LINKS, hiddenPages).map(({ label, href, icon }) => ({
		href,
		label,
		Icon: icon,
		isActive: isActive(href),
	}));

	// Renders nothing when no plugin advertises a user page.
	const plugins = pluginNavPages.map((page) => {
		const href = `/plugins/${page.pluginId}/page/${page.path}`;

		return {
			href,
			label: resolvePluginText(page.name, page.defaultLocale),
			Icon: getPluginIcon(page.icon),
			isActive: isActive(href),
		};
	});

	return { core, plugins };
}
