import {
	ContextMenuContent,
	ContextMenuGroup,
	ContextMenuItem,
	ContextMenuLabel,
	ContextMenuSeparator,
	ContextMenuShortcut,
} from "@/components/ui/context-menu";
import { m } from "@/paraglide/messages";
import type { MetadataCardMenuState } from "./metadata-card-menu-items";
import { type MenuParts, MetadataCardMenuSections } from "./metadata-card-menu-sections";

const CONTEXT_MENU_PARTS: MenuParts = {
	Group: ContextMenuGroup,
	Item: ContextMenuItem,
	Label: ContextMenuLabel,
	Separator: ContextMenuSeparator,
	shortcut: <ContextMenuShortcut>{m.common_key_enter()}</ContextMenuShortcut>,
};

export function MetadataCardContextMenu(state: MetadataCardMenuState) {
	return (
		<ContextMenuContent className="w-64">
			<MetadataCardMenuSections state={state} parts={CONTEXT_MENU_PARTS} />
		</ContextMenuContent>
	);
}
