import type { LucideIcon } from "lucide-react";
import { Compass, Film, Layers3, LayoutDashboard, ListVideo, Tv } from "lucide-react";
import { m } from "@/paraglide/messages";

export interface NavbarLinkItem {
	label: string;
	href: string;
	icon: LucideIcon;
	pluginId?: string;
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
	},
];

export const PRIMARY_MOBILE_LINKS = NAVBAR_LINKS.slice(0, 4);
