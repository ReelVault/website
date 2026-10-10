import type { LucideIcon } from "lucide-react";
import {
	BarChart3,
	Bell,
	Bookmark,
	Bug,
	Captions,
	Clock,
	Download,
	Eye,
	FileText,
	Film,
	Flag,
	Globe,
	Heart,
	Info,
	Layers,
	Link,
	ListPlus,
	MessageSquare,
	MessageSquareHeart,
	Palette,
	PanelsTopLeft,
	Plus,
	Puzzle,
	Scissors,
	Search,
	Send,
	Settings,
	Share2,
	Shield,
	Sliders,
	Sparkles,
	Star,
	Terminal,
	ThumbsUp,
	Tv,
	Users,
	Wrench,
	Zap,
} from "lucide-react";

/**
 * Icons a plugin may reference by name from its ui.json. Deliberately an
 * allowlist — importing the whole lucide set would bloat the bundle.
 */
const PLUGIN_ICONS: Record<string, LucideIcon> = {
	BarChart3,
	Bell,
	Bookmark,
	Bug,
	Captions,
	Clock,
	Download,
	Eye,
	FileText,
	Film,
	Flag,
	Globe,
	Heart,
	Info,
	Layers,
	Link,
	ListPlus,
	MessageSquare,
	MessageSquareHeart,
	Palette,
	PanelsTopLeft,
	Plus,
	Puzzle,
	Scissors,
	Search,
	Send,
	Settings,
	Share2,
	Shield,
	Sliders,
	Sparkles,
	Star,
	Terminal,
	ThumbsUp,
	Tv,
	Users,
	Wrench,
	Zap,
};

/** An allowlisted icon for the name; a missing or unknown name gets Puzzle (only a non-empty unknown name is reported). */
export function getPluginIcon(name?: string): LucideIcon {
	if (name && Object.hasOwn(PLUGIN_ICONS, name)) return PLUGIN_ICONS[name] ?? Puzzle;
	if (name) warnUnknownIcon(name);

	return Puzzle;
}

const warnedIcons = new Set<string>();

function warnUnknownIcon(name: string): void {
	if (import.meta.env.DEV && !warnedIcons.has(name)) {
		warnedIcons.add(name);
		console.warn(`[plugin-ui] icon "${name}" is not in the allowlist — falling back to Puzzle`);
	}
}
