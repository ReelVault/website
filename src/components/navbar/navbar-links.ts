import type { LucideIcon } from "lucide-react";
import { Compass, Film, Layers3, LayoutDashboard, ListVideo, Tv } from "lucide-react";
import { m } from "@/paraglide/messages";
import type { OptionalPageId } from "@/utils/hidden-pages";

export interface NavbarLinkItem {
	label: string;
	href: string;
	icon: LucideIcon;
	pluginId?: string;
	/** Optional page a profile may hide from the menus; pages without one are always shown. */
	pageId?: OptionalPageId;
}

export const NAVBAR_LINKS: NavbarLinkItem[] = [
	{
		get label() {
			return m.navbar_dashboard();
		},
		href: "/dashboard",
		icon: LayoutDashboard,
	},
	{
		get label() {
			return m.navbar_movies();
		},
		href: "/movies",
		icon: Film,
	},
	{
		get label() {
			return m.navbar_series();
		},
		href: "/series",
		icon: Tv,
	},
	{
		get label() {
			return m.navbar_collections();
		},
		href: "/collections",
		icon: Layers3,
		pageId: "collections",
	},
	{
		get label() {
			return m.components_navbar_watchlist_link();
		},
		href: "/watchlist",
		icon: ListVideo,
	},
	{
		get label() {
			return m.navbar_discovery();
		},
		href: "/discovery",
		icon: Compass,
		pageId: "discovery",
	},
];

export const PRIMARY_MOBILE_LINK_COUNT = 4;
