import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { Shield } from "lucide-react";
import {
	ContextMenuContent,
	ContextMenuGroup,
	ContextMenuItem,
	ContextMenuLabel,
	ContextMenuSeparator,
	ContextMenuShortcut,
} from "@/components/ui/context-menu";
import { m } from "@/paraglide/messages";
import { buildMetadataCardMenuItems, type MetadataCardMenuItem, type MetadataCardMenuState } from "./metadata-card-menu-items";

function ContextMenuItemRenderer({ item, onAction }: { item: MetadataCardMenuItem; onAction: (item: MetadataCardMenuItem) => void }) {
	return (
		<ContextMenuItem
			disabled={item.disabled}
			nativeButton={item.link ? false : undefined}
			render={item.link ? <Link to={item.link.to} params={{ id: item.link.id }} /> : undefined}
			onClick={
				item.action
					? (event) => {
							if (item.stopPropagation) event.stopPropagation();

							onAction(item);
						}
					: undefined
			}
			className="cursor-pointer"
		>
			<item.icon className={cn("size-4", item.iconClassName)} />
			<span>{item.label}</span>
			{item.showShortcut && <ContextMenuShortcut>{m.common_key_enter()}</ContextMenuShortcut>}
		</ContextMenuItem>
	);
}

function runItemAction(item: MetadataCardMenuItem): void {
	item.action?.();
}

export function MetadataCardContextMenu(state: MetadataCardMenuState) {
	const items = buildMetadataCardMenuItems(state);
	const mainItems = items.filter((item) => item.admin !== true);
	const adminItems = items.filter((item) => item.admin === true);

	return (
		<ContextMenuContent className="w-64">
			<ContextMenuGroup>
				<ContextMenuLabel className="truncate">{state.title}</ContextMenuLabel>
			</ContextMenuGroup>
			<ContextMenuSeparator />
			<ContextMenuGroup>
				{mainItems.map((item) => (
					<ContextMenuItemRenderer key={item.id} item={item} onAction={runItemAction} />
				))}
			</ContextMenuGroup>

			{/* Sekcja Administratora w Context Menu */}
			{state.isAdmin === true && (
				<>
					<ContextMenuSeparator />
					<ContextMenuGroup>
						<ContextMenuLabel className="flex items-center">
							<Shield className="size-3" />
							{m.common_admin_tools()}
						</ContextMenuLabel>
						{adminItems.map((item) => (
							<ContextMenuItemRenderer key={item.id} item={item} onAction={runItemAction} />
						))}
					</ContextMenuGroup>
				</>
			)}
		</ContextMenuContent>
	);
}
