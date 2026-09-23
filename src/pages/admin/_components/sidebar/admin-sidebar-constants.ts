import type { LucideIcon } from "lucide-react";
import {
	Activity,
	BarChart3,
	Bookmark,
	Building2,
	Clapperboard,
	Database,
	Download,
	FileText,
	FileVideo,
	Film,
	Hash,
	Languages,
	Layers,
	ListChecks,
	PieChart,
	ServerCog,
	Settings,
	ShieldCheck,
	Tag,
	Terminal,
	UserCog,
	Users,
} from "lucide-react";
import { m } from "@/paraglide/messages";

export interface MenuItem {
	name: string;
	href: string;
	icon: LucideIcon;
}

export interface MenuGroup {
	id: string;
	group: string;
	items: MenuItem[];
}

export const staticMenuGroups: MenuGroup[] = [
	{
		id: "overview",
		group: m.admin_main(),
		items: [
			{ name: m.admin_nav_dashboard(), href: "/admin/dashboard", icon: PieChart },
			{ name: m.admin_nav_analytics(), href: "/admin/analytics", icon: BarChart3 },
		],
	},
	{
		id: "catalog",
		group: m.admin_media_catalog(),
		items: [
			{ name: m.admin_nav_libraries(), href: "/admin/libraries", icon: Film },
			{ name: m.admin_nav_media_files(), href: "/admin/media", icon: FileVideo },
			{ name: m.admin_nav_metadata(), href: "/admin/metadata", icon: FileText },
			{ name: m.admin_nav_providers(), href: "/admin/providers", icon: ServerCog },
			{ name: m.admin_nav_subtitles(), href: "/admin/subtitles", icon: Languages },
			{ name: m.admin_nav_video_segments(), href: "/admin/markers", icon: Bookmark },
		],
	},
	{
		id: "taxonomy",
		group: m.admin_sidebar_taxonomy(),
		items: [
			{ name: m.admin_nav_collections(), href: "/admin/collections", icon: Layers },
			{ name: m.admin_nav_genres(), href: "/admin/genres", icon: Tag },
			{ name: m.admin_nav_keywords(), href: "/admin/keywords", icon: Hash },
			{ name: m.admin_nav_people(), href: "/admin/people", icon: Users },
			{ name: m.admin_companies_word(), href: "/admin/companies", icon: Building2 },
		],
	},
	{
		id: "administration",
		group: m.admin_sidebar_administration(),
		items: [
			{ name: m.admin_nav_users(), href: "/admin/users", icon: UserCog },
			{ name: m.admin_nav_security_audit(), href: "/admin/audit", icon: ShieldCheck },
		],
	},
	{
		id: "system",
		group: m.admin_sidebar_system(),
		items: [
			{ name: m.admin_nav_server_settings(), href: "/admin/settings", icon: Settings },
			{ name: m.admin_libraries_mode_database(), href: "/admin/database", icon: Database },
			{ name: m.admin_nav_workers(), href: "/admin/worker", icon: ListChecks },
			{ name: m.admin_downloads_heading(), href: "/admin/downloads", icon: Download },
			{ name: m.admin_nav_resources_system(), href: "/admin/resources", icon: Activity },
			{ name: m.admin_nav_trickplay(), href: "/admin/trickplay", icon: Clapperboard },
			{ name: m.admin_nav_server_logs(), href: "/admin/logs", icon: Terminal },
		],
	},
];
