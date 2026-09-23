import type { LucideIcon } from "lucide-react";
import { Bookmark, Check, Copy, Eye, ImageDown, Info, Pencil, Play, RefreshCw, Search } from "lucide-react";
import { m } from "@/paraglide/messages";

export interface MetadataCardMenuState {
	title: string;
	metadataId: string;
	mediaFileId?: string;
	isOnWatchlist?: boolean;
	isWatchlistPending?: boolean;
	isMarkingWatched?: boolean;
	isAdmin?: boolean;
	onAddToWatchlist: () => void;
	onMarkWatched?: () => void;
	onCopyLink: () => void;
	onCopyId: () => void;
	onOpenFileDetails: () => void;
	onOpenIdentify: () => void;
	onRefreshMetadata: () => void;
	onRefreshImages: () => void;
}

export interface MetadataCardMenuItem {
	id: string;
	icon: LucideIcon;
	iconClassName?: string;
	label: string;
	disabled?: boolean;
	stopPropagation?: boolean;
	action?: () => void;
	link?: { to: "/player/$id" | "/details/$id" | "/admin/metadata/$id"; id: string };
	showShortcut?: boolean;
	admin?: boolean;
}

function watchlistLabel(state: MetadataCardMenuState): string {
	if (state.isWatchlistPending === true) return m.components_watchlist_pending();

	if (state.isOnWatchlist === true) return m.components_remove_from_list();

	return m.components_add_to_list();
}

export function buildMetadataCardMenuItems(state: MetadataCardMenuState): MetadataCardMenuItem[] {
	const items: MetadataCardMenuItem[] = [];
	const { mediaFileId } = state;

	if (mediaFileId !== undefined) {
		items.push({
			id: "play",
			icon: Play,
			iconClassName: "fill-primary/20 text-primary",
			label: m.components_metadata_card_play(),
			link: { to: "/player/$id", id: mediaFileId },
			showShortcut: true,
		});
	}

	items.push(
		{
			id: "details",
			icon: Eye,
			iconClassName: "text-muted-foreground",
			label: m.common_details(),
			link: { to: "/details/$id", id: state.metadataId },
		},
		{
			id: "watchlist",
			icon: Bookmark,
			iconClassName: state.isOnWatchlist === true ? "fill-current text-primary" : "text-muted-foreground",
			label: watchlistLabel(state),
			disabled: state.isWatchlistPending === true,
			action: state.onAddToWatchlist,
		},
	);

	if (state.onMarkWatched) {
		items.push({
			id: "mark-watched",
			icon: Check,
			iconClassName: "text-muted-foreground",
			label: state.isMarkingWatched === true ? m.components_watchlist_pending() : m.components_mark_watched(),
			disabled: state.isMarkingWatched === true,
			action: state.onMarkWatched,
		});
	}

	items.push({
		id: "copy-link",
		icon: Copy,
		iconClassName: "text-muted-foreground",
		label: m.common_copy_link(),
		action: state.onCopyLink,
	});

	items.push({
		id: "file-info",
		icon: Info,
		iconClassName: "text-muted-foreground",
		label: m.components_file_info(),
		stopPropagation: true,
		action: state.onOpenFileDetails,
	});

	if (state.isAdmin === true) {
		items.push(
			{
				id: "edit",
				icon: Pencil,
				iconClassName: "text-primary",
				label: m.components_edit_section(),
				admin: true,
				link: { to: "/admin/metadata/$id", id: state.metadataId },
			},
			{
				id: "refresh-metadata",
				icon: RefreshCw,
				iconClassName: "text-primary",
				label: m.components_metadata_card_refresh_metadata(),
				stopPropagation: true,
				admin: true,
				action: state.onRefreshMetadata,
			},
			{
				id: "refresh-images",
				icon: ImageDown,
				iconClassName: "text-primary",
				label: m.components_metadata_card_force_artwork(),
				stopPropagation: true,
				admin: true,
				action: state.onRefreshImages,
			},
			{
				id: "identify",
				icon: Search,
				iconClassName: "text-primary",
				label: m.components_metadata_card_change_match(),
				stopPropagation: true,
				admin: true,
				action: state.onOpenIdentify,
			},
			{
				id: "copy-id",
				icon: Copy,
				iconClassName: "text-muted-foreground",
				label: m.common_copy_id(),
				admin: true,
				action: state.onCopyId,
			},
		);
	}

	return items;
}
