import type { LucideIcon } from "lucide-react";
import { Bell, Clock3, Monitor, MonitorSmartphone, Settings2, Sparkles } from "lucide-react";
import { m } from "@/paraglide/messages";

export interface UserNavItem {
	label: string;
	href: string;
	icon: LucideIcon;
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
	},
	{
		get label() {
			return m.auth_devices();
		},
		href: "/devices",
		icon: Monitor,
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
	},
	{
		get label() {
			return m.user_sidebar_settings();
		},
		href: "/settings",
		icon: Settings2,
	},
];
