import type { MediaMarkerType } from "reelvault-sdk";
import { m } from "@/paraglide/messages";

export const TYPE_CONFIG: Record<MediaMarkerType, { label: string; badgeClass: string }> = {
	intro: {
		label: m.plugins_markers_intro(),
		badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
	},
	credits: {
		label: m.plugins_markers_credits_word(),
		badgeClass: "bg-sky-500/15 text-sky-400 border-sky-500/30",
	},
	recap: {
		label: m.plugins_community_markers_shortcut_recap(),
		badgeClass: "bg-purple-500/15 text-purple-400 border-purple-500/30",
	},
	chapter: {
		label: m.plugins_markers_chapter(),
		badgeClass: "bg-muted text-muted-foreground border-border",
	},
	highlight: {
		label: m.plugins_markers_highlight_label(),
		badgeClass: "bg-rose-500/15 text-rose-400 border-rose-500/30",
	},
};
