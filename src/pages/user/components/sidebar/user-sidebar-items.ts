import type { LucideIcon } from "lucide-react";
import { Bell, Clock3, Monitor, MonitorSmartphone, Settings2, ShieldCheck, Sparkles } from "lucide-react";
import { m } from "@/paraglide/messages";
import type { OptionalPageId } from "@/utils/hidden-pages";

export interface UserNavItem {
	label: string;
	href: string;
	icon: LucideIcon;
	pageId?: OptionalPageId;
}

export const USER_NAV_ITEMS: UserNavItem[] = [
	{
		get label() {
			return m.user_sidebar_history();
		},
		href: "/history",
		icon: Clock3,
	},
	{
		get label() {
			return m.user_sidebar_insights();
		},
		href: "/insights",
		icon: Sparkles,
		pageId: "insights",
	},
	{
		get label() {
			return m.auth_devices();
		},
		href: "/devices",
		icon: Monitor,
		pageId: "devices",
	},
	{
		get label() {
			return m.user_sidebar_notifications();
		},
		href: "/notifications",
		icon: Bell,
	},
	{
		get label() {
			return m.user_remote_pilot_link();
		},
		href: "/remote",
		icon: MonitorSmartphone,
		pageId: "remote",
	},
	{
		get label() {
			return m.user_security();
		},
		href: "/security",
		icon: ShieldCheck,
	},
	{
		get label() {
			return m.user_sidebar_settings();
		},
		href: "/settings",
		icon: Settings2,
	},
];
