import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { m } from "@/paraglide/messages";
import { PluginSlotHost } from "@/plugin-host/slot-host.lazy";
import type { MetadataCardMenuState } from "./metadata-card-menu-items";
import { type MenuParts, MetadataCardMenuSections } from "./metadata-card-menu-sections";

const DROPDOWN_MENU_PARTS: MenuParts = {
	Group: DropdownMenuGroup,
	Item: DropdownMenuItem,
	Label: DropdownMenuLabel,
	Separator: DropdownMenuSeparator,
};

export function MetadataCardDropdownMenu(state: MetadataCardMenuState) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				aria-label={m.components_options_for({ title: state.title })}
				render={<Button variant="outline" size="icon" />}
				className="flex items-center justify-center"
			>
				<MoreVertical className="text-foreground size-4" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-64">
				<MetadataCardMenuSections state={state} parts={DROPDOWN_MENU_PARTS} extra={<PluginSlotHost name="media-file-card-actions" />} />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
