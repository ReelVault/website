import type { MediaMarkerType } from "@reelvault/sdk";
import type { ComponentProps } from "react";
import type { Badge } from "@/components/ui/badge";
import { m } from "@/paraglide/messages";

type BadgeTone = NonNullable<ComponentProps<typeof Badge>["variant"]>;

export const TYPE_CONFIG: Record<MediaMarkerType, { label: string; badgeVariant: BadgeTone }> = {
	intro: {
		label: m.plugins_markers_intro(),
		badgeVariant: "warning",
	},
	credits: {
		label: m.plugins_markers_credits_word(),
		badgeVariant: "info",
	},
	recap: {
		label: m.plugins_community_markers_shortcut_recap(),
		badgeVariant: "primary",
	},
	chapter: {
		label: m.plugins_markers_chapter(),
		badgeVariant: "muted",
	},
	highlight: {
		label: m.plugins_markers_highlight_label(),
		badgeVariant: "destructive",
	},
};

/** Narrows a URL value to a marker type; any other value means no type filter. */
export function isMediaMarkerType(value: string): value is MediaMarkerType {
	return Object.hasOwn(TYPE_CONFIG, value);
}
